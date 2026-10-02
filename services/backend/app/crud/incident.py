import uuid

from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentReason


def create_incident(
    db: Session,
    driver_id: uuid.UUID,
    ride_id: uuid.UUID,
    reason: IncidentReason,
    description: str | None,
) -> Incident:
    incident = Incident(driver_id=driver_id, ride_id=ride_id, reason=reason, description=description)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def list_incidents(db: Session, skip: int = 0, limit: int = 100) -> list[Incident]:
    return (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_incident(db: Session, incident_id: uuid.UUID) -> Incident | None:
    return db.query(Incident).filter(Incident.id == incident_id).first()