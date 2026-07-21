import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RideStatus(str, enum.Enum):
    PENDING = "en_attente"
    ASSIGNED = "assignee"
    EN_ROUTE = "en_route"
    ARRIVED_HOME = "arrive_au_domicile"
    CHILD_PICKED_UP = "enfant_recupere"
    EN_ROUTE_TO_INSTITUTION = "en_route_vers_etablissement"
    ARRIVED = "arrive"
    CHILD_DROPPED_OFF = "enfant_depose"
    COMPLETED = "terminee"
    CANCELLED = "annulee"
    INCIDENT = "incident"


class Ride(Base):
    __tablename__ = "rides"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    child_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("children.id"))
    driver_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id"))

    pickup_address: Mapped[str] = mapped_column(String(500), nullable=False)
    pickup_latitude: Mapped[float | None]
    pickup_longitude: Mapped[float | None]
    dropoff_address: Mapped[str] = mapped_column(String(500), nullable=False)
    dropoff_latitude: Mapped[float | None]
    dropoff_longitude: Mapped[float | None]

    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actual_pickup_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    actual_dropoff_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    distance_km: Mapped[float | None]
    duration_minutes: Mapped[float | None]
    price: Mapped[float | None]

    status: Mapped[RideStatus] = mapped_column(Enum(RideStatus), default=RideStatus.PENDING)
    comment: Mapped[str | None] = mapped_column(String(1000))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    child: Mapped["Child"] = relationship(back_populates="rides")
    driver: Mapped["Driver"] = relationship(back_populates="rides")


RIDE_STATUS_LABELS_FR: dict[RideStatus, str] = {
    RideStatus.PENDING: "En attente",
    RideStatus.ASSIGNED: "Assignée",
    RideStatus.EN_ROUTE: "En route",
    RideStatus.ARRIVED_HOME: "Arrivé au domicile",
    RideStatus.CHILD_PICKED_UP: "Enfant récupéré",
    RideStatus.EN_ROUTE_TO_INSTITUTION: "En route vers l'établissement",
    RideStatus.ARRIVED: "Arrivé",
    RideStatus.CHILD_DROPPED_OFF: "Enfant déposé",
    RideStatus.COMPLETED: "Terminée",
    RideStatus.CANCELLED: "Annulée",
    RideStatus.INCIDENT: "Incident",
}

# Transitions de statut autorisées — utilisé par le service pour valider les changements
ALLOWED_TRANSITIONS: dict[RideStatus, set[RideStatus]] = {
    RideStatus.PENDING: {RideStatus.ASSIGNED, RideStatus.CANCELLED},
    RideStatus.ASSIGNED: {RideStatus.EN_ROUTE, RideStatus.CANCELLED, RideStatus.INCIDENT},
    RideStatus.EN_ROUTE: {RideStatus.ARRIVED_HOME, RideStatus.INCIDENT, RideStatus.CANCELLED},
    RideStatus.ARRIVED_HOME: {RideStatus.CHILD_PICKED_UP, RideStatus.INCIDENT},
    RideStatus.CHILD_PICKED_UP: {RideStatus.EN_ROUTE_TO_INSTITUTION, RideStatus.INCIDENT},
    RideStatus.EN_ROUTE_TO_INSTITUTION: {RideStatus.ARRIVED, RideStatus.INCIDENT},
    RideStatus.ARRIVED: {RideStatus.CHILD_DROPPED_OFF, RideStatus.INCIDENT},
    RideStatus.CHILD_DROPPED_OFF: {RideStatus.COMPLETED},
    RideStatus.COMPLETED: set(),
    RideStatus.CANCELLED: set(),
    RideStatus.INCIDENT: {RideStatus.EN_ROUTE, RideStatus.CANCELLED, RideStatus.COMPLETED},
}
