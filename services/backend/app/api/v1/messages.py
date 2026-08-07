import uuid

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.websocket_manager import publish_notification
from app.crud import message as message_crud
from app.db.session import get_db
from app.models.message import SenderRole
from app.models.user import User, UserRole
from app.schemas.message import ConversationSummary, MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[ConversationSummary])
def list_conversations(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    """Utilisé par le dashboard (page /messages) pour afficher la liste des
    conversations avec, pour chacune, le dernier message et le nombre de
    non-lus."""
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

    # Diffuse sur le canal WebSocket existant (/ws/notifications) — l'app
    # mobile et le dashboard peuvent tous deux s'y abonner pour être notifiés
    # en direct d'un nouveau message.
    await publish_notification(
        user_id=str(driver_id) if sender_role == SenderRole.ADMIN else "dispatch",
        title="Nouveau message",
        body=payload.content[:120],
    )
    return message
