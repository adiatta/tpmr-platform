import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.models.message import Message, SenderRole


def create_message(db: Session, driver_id: uuid.UUID, sender_role: SenderRole, content: str) -> Message:
    message = Message(driver_id=driver_id, sender_role=sender_role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def list_messages(db: Session, driver_id: uuid.UUID) -> list[Message]:
    stmt = select(Message).where(Message.driver_id == driver_id).order_by(Message.created_at)
    return list(db.execute(stmt).scalars().all())


def mark_conversation_read(db: Session, driver_id: uuid.UUID, reader_role: SenderRole) -> None:
    """Marque comme lus les messages envoyés par L'AUTRE partie — un admin qui
    ouvre la conversation marque les messages du chauffeur comme lus, et
    inversement."""
    other_role = SenderRole.DRIVER if reader_role == SenderRole.ADMIN else SenderRole.ADMIN
    stmt = select(Message).where(Message.driver_id == driver_id, Message.sender_role == other_role, Message.is_read.is_(False))
    for message in db.execute(stmt).scalars().all():
        message.is_read = True
    db.commit()


def list_conversations(db: Session) -> list[dict]:
    """Un résumé par chauffeur : dernier message + nombre de non-lus (côté
    admin, donc messages envoyés par le chauffeur et non encore lus)."""
    drivers = db.execute(select(Driver)).scalars().all()
    summaries = []
    for driver in drivers:
        last = db.execute(
            select(Message).where(Message.driver_id == driver.id).order_by(Message.created_at.desc()).limit(1)
        ).scalars().first()
        unread = db.execute(
            select(func.count()).select_from(Message).where(
                Message.driver_id == driver.id,
                Message.sender_role == SenderRole.DRIVER,
                Message.is_read.is_(False),
            )
        ).scalar_one()
        summaries.append(
            {
                "driver_id": driver.id,
                "driver_name": driver.full_name,
                "last_message": last.content if last else None,
                "last_message_at": last.created_at if last else None,
                "unread_count": unread,
            }
        )
    return summaries
