import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.incident import IncidentReason, IncidentStatus


class IncidentCreate(BaseModel):
    ride_id: uuid.UUID
    reason: IncidentReason
    description: str | None = None


class IncidentOut(BaseModel):
    id: uuid.UUID
    ride_id: uuid.UUID
    driver_id: uuid.UUID
    reason: IncidentReason
    description: str | None
    status: IncidentStatus
    created_at: datetime

    model_config = {"from_attributes": True}