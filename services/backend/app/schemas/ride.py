import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.ride import RideStatus


class RideCreate(BaseModel):
    child_id: uuid.UUID
    driver_id: uuid.UUID | None = None
    pickup_address: str
    dropoff_address: str
    scheduled_at: datetime
    comment: str | None = None


class RideUpdate(BaseModel):
    driver_id: uuid.UUID | None = None
    pickup_address: str | None = None
    dropoff_address: str | None = None
    scheduled_at: datetime | None = None
    comment: str | None = None


class RideStatusUpdate(BaseModel):
    status: RideStatus


class RideOut(BaseModel):
    id: uuid.UUID
    child_id: uuid.UUID
    driver_id: uuid.UUID | None = None
    pickup_address: str
    dropoff_address: str
    scheduled_at: datetime
    actual_pickup_at: datetime | None = None
    actual_dropoff_at: datetime | None = None
    distance_km: float | None = None
    duration_minutes: float | None = None
    price: float | None = None
    status: RideStatus
    comment: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
