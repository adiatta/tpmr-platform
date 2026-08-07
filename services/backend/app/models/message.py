import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SenderRole(str, enum.Enum):
    ADMIN = "admin"
    DRIVER = "driver"


class Message(Base):
    """Une conversation = tous les messages liés à un driver_id donné,
    échangés entre le dispatch (admin) et ce chauffeur. Modèle volontairement
    simple (pas de table Conversation séparée) car chaque chauffeur n'a qu'un
    seul fil avec le dispatch dans cette version."""

    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    driver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)
    sender_role: Mapped[SenderRole] = mapped_column(Enum(SenderRole), nullable=False)
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    is_read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    driver = relationship("Driver")
