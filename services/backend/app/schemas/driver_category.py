import uuid

from pydantic import BaseModel


class DriverCategoryCreate(BaseModel):
    name: str
    description: str | None = None


class DriverCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}
