import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.ride import RideStatus


class RideCreate(BaseModel):
    child_id: uuid.UUID
    driver_id: uuid.UUID | None = None
    pickup_address: str
    pickup_latitude: float | None = None
    pickup_longitude: float | None = None
    dropoff_address: str
    dropoff_latitude: float | None = None
    dropoff_longitude: float | None = None
    scheduled_at: datetime
    comment: str | None = None


class RideUpdate(BaseModel):
    driver_id: uuid.UUID | None = None
    pickup_address: str | None = None
    pickup_latitude: float | None = None
    pickup_longitude: float | None = None
    dropoff_address: str | None = None
    dropoff_latitude: float | None = None
    dropoff_longitude: float | None = None
    scheduled_at: datetime | None = None
    comment: str | None = None


class RideStatusUpdate(BaseModel):
    status: RideStatus


class RideOut(BaseModel):
    id: uuid.UUID
    child_id: uuid.UUID
    driver_id: uuid.UUID | None = None
    pickup_address: str
    pickup_latitude: float | None = None
    pickup_longitude: float | None = None
    dropoff_address: str
    dropoff_latitude: float | None = None
    dropoff_longitude: float | None = None
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

    # Pas un champ de la table "rides" — vient de la relation ride.child
    # (table "children"). N'est PAS rempli automatiquement par
    # `model_validate(ride)` en mode from_attributes : l'API (rides.py) le
    # renseigne explicitement après coup, cf. _to_ride_out(). Affiché côté
    # mobile pour que le chauffeur puisse appeler le responsable.
    guardian_phone: str | None = None

    model_config = {"from_attributes": True}