import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class DriverCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class DriverCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    category_id: uuid.UUID | None = None
    vehicle_plate: str | None = None
    vehicle_model: str | None = None


class DriverUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    category_id: uuid.UUID | None = None
    vehicle_plate: str | None = None
    vehicle_model: str | None = None
    is_active: bool | None = None


class DriverOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str
    category: DriverCategoryOut | None = None
    vehicle_plate: str | None = None
    vehicle_model: str | None = None
    is_online: bool
    current_latitude: float | None = None
    current_longitude: float | None = None
    last_position_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DriverPositionUpdate(BaseModel):
    latitude: float
    longitude: float
