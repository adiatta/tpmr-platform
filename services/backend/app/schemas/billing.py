import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.models.invoice import InvoiceStatus


class GenerateInvoicesRequest(BaseModel):
    period_start: date
    period_end: date


class InvoiceLineOut(BaseModel):
    id: uuid.UUID
    ride_id: uuid.UUID
    amount: float

    model_config = {"from_attributes": True}


class InvoiceOut(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID | None = None
    institution_name: str | None = None
    child_id: uuid.UUID | None = None
    period_start: date
    period_end: date
    status: InvoiceStatus
    total_amount: float
    rides_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceDetailOut(InvoiceOut):
    lines: list[InvoiceLineOut]


class InvoiceStatusUpdate(BaseModel):
    status: InvoiceStatus
