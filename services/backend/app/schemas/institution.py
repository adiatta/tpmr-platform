import uuid

from pydantic import BaseModel


class InstitutionCreate(BaseModel):
    name: str
    address: str
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: str | None = None
    phone: str | None = None


class InstitutionUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: str | None = None
    phone: str | None = None


class InstitutionOut(BaseModel):
    id: uuid.UUID
    name: str
    address: str
    latitude: float | None = None
    longitude: float | None = None
    opening_hours: str | None = None
    phone: str | None = None

    model_config = {"from_attributes": True}
