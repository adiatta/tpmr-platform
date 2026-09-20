import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DRIVER = "driver"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Récupération de mot de passe : un token à usage unique, valable une
    # heure, généré par POST /auth/forgot-password et consommé par
    # POST /auth/reset-password. Nullable — vide tant qu'aucune demande de
    # réinitialisation n'est en cours.
    reset_token: Mapped[str | None] = mapped_column(String(255), unique=True)
    reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
