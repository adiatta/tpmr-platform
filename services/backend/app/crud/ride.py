import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.ride import ALLOWED_TRANSITIONS, Ride, RideStatus
from app.schemas.ride import RideCreate, RideUpdate
from app.services import pricing_service


class InvalidStatusTransition(Exception):
    pass


def create_ride(db: Session, data: RideCreate) -> Ride:
    ride = Ride(**data.model_dump())
    if data.driver_id:
        ride.status = RideStatus.ASSIGNED
    db.add(ride)
    db.commit()
    db.refresh(ride)
    return ride


def get_ride(db: Session, ride_id: uuid.UUID) -> Ride | None:
    return db.get(Ride, ride_id)


def list_rides(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: RideStatus | None = None,
    driver_id: uuid.UUID | None = None,
) -> list[Ride]:
    stmt = select(Ride)
    if status is not None:
        stmt = stmt.where(Ride.status == status)
    if driver_id is not None:
        stmt = stmt.where(Ride.driver_id == driver_id)
    stmt = stmt.order_by(Ride.scheduled_at).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


def update_ride(db: Session, ride: Ride, data: RideUpdate) -> Ride:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ride, field, value)
    db.commit()
    db.refresh(ride)
    return ride


def change_status(db: Session, ride: Ride, new_status: RideStatus) -> Ride:
    allowed = ALLOWED_TRANSITIONS.get(ride.status, set())
    if new_status not in allowed:
        raise InvalidStatusTransition(
            f"Transition {ride.status.value} → {new_status.value} non autorisée"
        )

    ride.status = new_status

    # Calcul automatique du prix une fois la course terminée
    if new_status == RideStatus.COMPLETED and ride.distance_km:
        child = db.get(Child, ride.child_id)
        pricing = pricing_service.resolve_pricing(
            db, child_id=ride.child_id, institution_id=child.institution_id if child else None
        )
        ride.price = pricing_service.compute_price(pricing, ride.distance_km)

    db.commit()
    db.refresh(ride)
    return ride


def delete_ride(db: Session, ride: Ride) -> None:
    db.delete(ride)
    db.commit()
