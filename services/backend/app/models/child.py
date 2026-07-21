import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Child(Base):
    __tablename__ = "children"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date)

    home_address: Mapped[str] = mapped_column(String(500), nullable=False)
    home_latitude: Mapped[float | None]
    home_longitude: Mapped[float | None]

    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id")
    )

    guardian_name: Mapped[str] = mapped_column(String(255), nullable=False)
    guardian_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    special_needs: Mapped[str | None] = mapped_column(String(1000))

    institution: Mapped["Institution"] = relationship(back_populates="children")
    rides: Mapped[list["Ride"]] = relationship(back_populates="child")
