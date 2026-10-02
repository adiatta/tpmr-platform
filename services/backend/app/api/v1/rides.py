import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.websocket_manager import publish_notification
from app.crud import ride as ride_crud
from app.crud.ride import InvalidStatusTransition
from app.db.session import get_db
from app.models.ride import RIDE_STATUS_LABELS_FR, RideStatus
from app.models.user import User
from app.schemas.ride import RideCreate, RideOut, RideStatusUpdate, RideUpdate
from app.services.geo_service import compute_route
from app.services.push_notifications import send_push_notification

router = APIRouter(prefix="/rides", tags=["rides"])


def _to_ride_out(ride) -> RideOut:
    """Convertit un Ride ORM en RideOut, en ajoutant guardian_phone depuis
    la relation ride.child — ce champ n'existe pas sur la table "rides",
    `RideOut.model_validate(ride)` seul ne le remplit donc pas.

    HYPOTHÈSE : le modèle Ride expose une relation `child` (comme
    `ride.child.first_name` déjà utilisé dans incidents.py). Si ta relation
    porte un autre nom, remplace `ride.child` ci-dessous en conséquence."""
    out = RideOut.model_validate(ride)
    child = getattr(ride, "child", None)
    if child is not None:
        out.guardian_phone = getattr(child, "guardian_phone", None)
    return out


async def _notify_driver_assigned(ride) -> None:
    """Notifie le chauffeur (WebSocket + push) qu'une course lui est
    assignée. Appelé à la création ET à la mise à jour d'une course, dans
    les deux cas seulement si un chauffeur est effectivement assigné.

    Le WebSocket est ce qui fait apparaître la course en direct dans l'app
    (RealtimeSync invalide la requête "rides" chez tous les clients
    connectés dès qu'une notification passe) ; le push Expo est le filet de
    sécurité si l'app est fermée ou en arrière-plan."""
    if not ride.driver_id:
        return

    await publish_notification(
        user_id=str(ride.driver_id),
        title="Nouvelle course assignée",
        body=f"Départ prévu à {ride.scheduled_at.strftime('%H:%M')}",
    )

    if ride.driver and ride.driver.push_token:
        asyncio.create_task(
            send_push_notification(
                ride.driver.push_token,
                "Nouvelle course assignée",
                f"Départ prévu à {ride.scheduled_at.strftime('%H:%M')}",
            )
        )


@router.post("", response_model=RideOut, status_code=status.HTTP_201_CREATED)
async def create_ride(
    payload: RideCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> RideOut:
    ride = ride_crud.create_ride(db, payload)
    await _notify_driver_assigned(ride)
    return _to_ride_out(ride)


@router.get("", response_model=list[RideOut])
def list_rides(
    skip: int = 0,
    limit: int = 100,
    status_filter: RideStatus | None = None,
    driver_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RideOut]:
    rides = ride_crud.list_rides(db, skip, limit, status_filter, driver_id)
    return [_to_ride_out(r) for r in rides]


@router.get("/{ride_id}", response_model=RideOut)
def get_ride(
    ride_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> RideOut:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    return _to_ride_out(ride)


@router.patch("/{ride_id}", response_model=RideOut)
async def update_ride(
    ride_id: uuid.UUID,
    payload: RideUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> RideOut:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    updated = ride_crud.update_ride(db, ride, payload)

    # Notifie uniquement si CETTE requête assigne/réassigne un chauffeur —
    # pas à chaque modification (heure, adresse...) sans changement de
    # chauffeur, pour éviter une notification "nouvelle course" à chaque
    # correction mineure.
    if payload.driver_id:
        await _notify_driver_assigned(updated)

    return _to_ride_out(updated)


@router.post("/{ride_id}/status", response_model=RideOut)
async def change_status(
    ride_id: uuid.UUID,
    payload: RideStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RideOut:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    try:
        updated = ride_crud.change_status(db, ride, payload.status)
    except InvalidStatusTransition as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    await publish_notification(
        user_id="dispatch",
        title="Mise à jour de course",
        body=f"Course {updated.id} → {RIDE_STATUS_LABELS_FR[updated.status]}",
    )
    return _to_ride_out(updated)


@router.get("/{ride_id}/eta")
def get_eta(
    ride_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride or not ride.driver:
        raise HTTPException(status_code=404, detail="Course ou chauffeur introuvable")
    if ride.driver.current_latitude is None:
        raise HTTPException(status_code=409, detail="Position du chauffeur non disponible")

    estimate = compute_route(
        ride.driver.current_latitude,
        ride.driver.current_longitude,
        ride.dropoff_latitude or 0,
        ride.dropoff_longitude or 0,
    )
    return {"distance_km": estimate.distance_km, "duration_minutes": estimate.duration_minutes}


@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ride(
    ride_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    try:
        ride_crud.delete_ride(db, ride)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer cette course : elle est déjà rattachée à une "
            "facture. Supprimez d'abord la facture concernée si nécessaire.",
        ) from None