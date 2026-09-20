import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DriverCategory(Base):
    __tablename__ = "driver_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))

    drivers: Mapped[list["Driver"]] = relationship(back_populates="category")


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("driver_categories.id")
    )

    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    vehicle_plate: Mapped[str | None] = mapped_column(String(20))
    vehicle_model: Mapped[str | None] = mapped_column(String(100))

    is_online: Mapped[bool] = mapped_column(default=False)
    current_latitude: Mapped[float | None] = mapped_column(Float)
    current_longitude: Mapped[float | None] = mapped_column(Float)
    last_position_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Token Expo Push (ExponentPushToken[...]) — enregistré automatiquement
    # par l'app mobile après connexion, utilisé pour les notifications push
    # (app fermée ou en arrière-plan). Nullable : un chauffeur qui ne s'est
    # jamais connecté sur mobile n'en a pas encore.
    push_token: Mapped[str | None] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User")
    category: Mapped["DriverCategory"] = relationship(back_populates="drivers")
    rides: Mapped[list["Ride"]] = relationship(back_populates="driver")

    @property
    def full_name(self) -> str:
        return self.user.full_name

    @property
    def email(self) -> str:
        return self.user.email
