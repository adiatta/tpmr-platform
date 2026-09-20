import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.websocket_manager import publish_notification
from app.crud import driver as driver_crud
from app.crud import message as message_crud
from app.db.session import get_db
from app.models.message import SenderRole
from app.models.user import User, UserRole
from app.schemas.message import ConversationSummary, MessageCreate, MessageOut
from app.services.push_notifications import send_push_notification

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[ConversationSummary])
def list_conversations(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    return message_crud.list_conversations(db)


@router.get("/{driver_id}", response_model=list[MessageOut])
def get_conversation(
    driver_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[MessageOut]:
    reader_role = SenderRole.ADMIN if current_user.role == UserRole.ADMIN else SenderRole.DRIVER
    message_crud.mark_conversation_read(db, driver_id, reader_role)
    return message_crud.list_messages(db, driver_id)


@router.post("/{driver_id}", response_model=MessageOut)
async def send_message(
    driver_id: uuid.UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageOut:
    sender_role = SenderRole.ADMIN if current_user.role == UserRole.ADMIN else SenderRole.DRIVER
    message = message_crud.create_message(db, driver_id, sender_role, payload.content)

    await publish_notification(
        user_id=str(driver_id) if sender_role == SenderRole.ADMIN else "dispatch",
        title="Nouveau message",
        body=payload.content[:120],
    )

    if sender_role == SenderRole.ADMIN:
        driver = driver_crud.get_driver(db, driver_id)
        if driver and driver.push_token:
            await send_push_notification(driver.push_token, "Message du dispatch", payload.content[:120])

    return message


@router.delete("/message/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> None:
    """Supprime un message précis. Accessible à l'admin comme au chauffeur —
    pas de restriction à l'auteur pour l'instant (MVP), à durcir si besoin."""
    message = message_crud.get_message(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message introuvable")
    message_crud.delete_message(db, message)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    driver_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> None:
    """Vide toute la conversation avec un chauffeur (tous ses messages,
    dans les deux sens)."""
    message_crud.delete_conversation(db, driver_id)
