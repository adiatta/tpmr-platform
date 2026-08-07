import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.message import SenderRole


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: uuid.UUID
    driver_id: uuid.UUID
    sender_role: SenderRole
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    driver_id: uuid.UUID
    driver_name: str
    last_message: str | None = None
    last_message_at: datetime | None = None
    unread_count: int
