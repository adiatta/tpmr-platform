from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.websocket_manager import publish_notification
from app.crud import incident as incident_crud
from app.crud import ride as ride_crud
from app.db.session import get_db
from app.models.incident import IncidentReason
from app.models.user import User
from app.schemas.incident import IncidentCreate, IncidentOut

router = APIRouter(prefix="/incidents", tags=["incidents"])

REASON_LABELS_FR = {
    IncidentReason.RETARD: "Retard",
    IncidentReason.PROBLEME_VEHICULE: "Problème véhicule",
    IncidentReason.COMPORTEMENT_ENFANT: "Comportement de l'enfant",
    IncidentReason.ACCIDENT: "Accident",
    IncidentReason.AUTRE: "Autre",
}


@router.post("", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
async def report_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> IncidentOut:
    """Appelé depuis l'app mobile, écran détail de course (bouton
    "Signaler un incident"). Le driver_id n'est volontairement pas pris
    dans le payload envoyé par le client : il est retrouvé via la course,
    pour éviter qu'un chauffeur puisse signaler un incident au nom d'un
    autre en falsifiant le driver_id."""
    ride = ride_crud.get_ride(db, payload.ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Course introuvable")
    if not ride.driver_id:
        raise HTTPException(status_code=409, detail="Cette course n'a pas de chauffeur assigné")

    incident = incident_crud.create_incident(
        db,
        driver_id=ride.driver_id,
        ride_id=ride.id,
        reason=payload.reason,
        description=payload.description,
    )

    driver_name = ride.driver.full_name if ride.driver else "Un chauffeur"
    await publish_notification(
        user_id="dispatch",
        title=f"Incident signalé — {REASON_LABELS_FR[payload.reason]}",
        body=f"{driver_name} • {ride.child.first_name} {ride.child.last_name}" if ride.child else driver_name,
    )

    return incident


@router.get("", response_model=list[IncidentOut])
def list_incidents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[IncidentOut]:
    return incident_crud.list_incidents(db, skip, limit)