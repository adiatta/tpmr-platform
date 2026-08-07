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

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User")
    category: Mapped["DriverCategory"] = relationship(back_populates="drivers")
    rides: Mapped[list["Ride"]] = relationship(back_populates="driver")

    # DriverOut (schemas/driver.py) attend full_name/email, qui vivent en
    # réalité sur User (auth centralisée là-bas, cf. app/models/user.py).
    # Ces propriétés font le pont pour que la sérialisation Pydantic
    # (response_model=DriverOut, from_attributes=True) trouve ces champs
    # directement sur l'objet Driver, sans dupliquer les colonnes.
    @property
    def full_name(self) -> str:
        return self.user.full_name

    @property
    def email(self) -> str:
        return self.user.email