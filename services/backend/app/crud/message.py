import uuid

from sqlalchemy import delete, func, select
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


def get_message(db: Session, message_id: uuid.UUID) -> Message | None:
    return db.get(Message, message_id)


def delete_message(db: Session, message: Message) -> None:
    db.delete(message)
    db.commit()


def delete_conversation(db: Session, driver_id: uuid.UUID) -> None:
    db.execute(delete(Message).where(Message.driver_id == driver_id))
    db.commit()


def mark_conversation_read(db: Session, driver_id: uuid.UUID, reader_role: SenderRole) -> None:
    other_role = SenderRole.DRIVER if reader_role == SenderRole.ADMIN else SenderRole.ADMIN
    stmt = select(Message).where(Message.driver_id == driver_id, Message.sender_role == other_role, Message.is_read.is_(False))
    for message in db.execute(stmt).scalars().all():
        message.is_read = True
    db.commit()


def list_conversations(db: Session) -> list[dict]:
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
