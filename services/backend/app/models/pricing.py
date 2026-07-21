import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Pricing(Base):
    """Grille tarifaire. Un tarif peut être global (child_id/institution_id nuls)
    ou personnalisé pour un enfant/établissement donné (le plus spécifique l'emporte)."""

    __tablename__ = "pricing"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    base_fee: Mapped[float] = mapped_column(default=0)
    price_per_km: Mapped[float] = mapped_column(default=0)
    long_distance_threshold_km: Mapped[float] = mapped_column(default=30)
    long_distance_surcharge_pct: Mapped[float] = mapped_column(default=0)

    child_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("children.id"))
    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id")
    )
