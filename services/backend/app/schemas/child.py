import uuid
from datetime import date

from pydantic import BaseModel


class ChildCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    home_address: str
    institution_id: uuid.UUID | None = None
    guardian_name: str
    guardian_phone: str
    special_needs: str | None = None


class ChildUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    home_address: str | None = None
    institution_id: uuid.UUID | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    special_needs: str | None = None


class ChildOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    home_address: str
    institution_id: uuid.UUID | None = None
    guardian_name: str
    guardian_phone: str
    special_needs: str | None = None

    model_config = {"from_attributes": True}
