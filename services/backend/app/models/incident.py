import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IncidentReason(str, enum.Enum):
    RETARD = "retard"
    PROBLEME_VEHICULE = "probleme_vehicule"
    COMPORTEMENT_ENFANT = "comportement_enfant"
    ACCIDENT = "accident"
    AUTRE = "autre"


class IncidentStatus(str, enum.Enum):
    NOUVEAU = "nouveau"
    TRAITE = "traite"


class Incident(Base):
    """Un signalement fait par un chauffeur depuis l'app mobile, rattaché à
    une course précise. Volontairement simple (pas de pièce jointe, pas de
    fil de discussion) pour un MVP — à enrichir si besoin (photos, statut
    plus fin, historique de traitement)."""

    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ride_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rides.id"), nullable=False)
    driver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)
    reason: Mapped[IncidentReason] = mapped_column(Enum(IncidentReason), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[IncidentStatus] = mapped_column(Enum(IncidentStatus), default=IncidentStatus.NOUVEAU)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    ride = relationship("Ride")
    driver = relationship("Driver")