import uuid

from pydantic import BaseModel


class PricingCreate(BaseModel):
    name: str
    base_fee: float = 0
    price_per_km: float = 0
    long_distance_threshold_km: float = 30
    long_distance_surcharge_pct: float = 0
    child_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None


class PricingUpdate(BaseModel):
    name: str | None = None
    base_fee: float | None = None
    price_per_km: float | None = None
    long_distance_threshold_km: float | None = None
    long_distance_surcharge_pct: float | None = None
    child_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None


class PricingOut(BaseModel):
    id: uuid.UUID
    name: str
    base_fee: float
    price_per_km: float
    long_distance_threshold_km: float
    long_distance_surcharge_pct: float
    child_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None

    model_config = {"from_attributes": True}


class PricingSimulationRequest(BaseModel):
    distance_km: float
    child_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None


class PricingSimulationResult(BaseModel):
    price: float
    pricing_rule_used: str | None = None
