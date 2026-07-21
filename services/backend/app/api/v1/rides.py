import uuid

from fastapi import APIRouter, Depends, HTTPException, status
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

router = APIRouter(prefix="/rides", tags=["rides"])


@router.post("", response_model=RideOut, status_code=status.HTTP_201_CREATED)
def create_ride(
    payload: RideCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> RideOut:
    return ride_crud.create_ride(db, payload)


@router.get("", response_model=list[RideOut])
def list_rides(
    skip: int = 0,
    limit: int = 100,
    status_filter: RideStatus | None = None,
    driver_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RideOut]:
    """Les admins voient toutes les courses ; un chauffeur ne voit que les siennes
    (filtrage à affiner selon le lien User→Driver une fois l'app mobile branchée)."""
    return ride_crud.list_rides(db, skip, limit, status_filter, driver_id)


@router.get("/{ride_id}", response_model=RideOut)
def get_ride(
    ride_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> RideOut:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    return ride


@router.patch("/{ride_id}", response_model=RideOut)
def update_ride(
    ride_id: uuid.UUID,
    payload: RideUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> RideOut:
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    return ride_crud.update_ride(db, ride, payload)


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

    # Notifie le dispatch (dashboard admin) de chaque changement de statut.
    # En prod : cibler aussi le parent/responsable légal selon le statut.
    await publish_notification(
        user_id="dispatch",
        title="Mise à jour de course",
        body=f"Course {updated.id} → {RIDE_STATUS_LABELS_FR[updated.status]}",
    )
    return updated


@router.get("/{ride_id}/eta")
def get_eta(
    ride_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    """Calcule distance/durée/ETA en fonction de la position actuelle du chauffeur."""
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
    ride_crud.delete_ride(db, ride)
