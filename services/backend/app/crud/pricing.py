import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.pricing import Pricing
from app.schemas.pricing import PricingCreate, PricingUpdate


def create_pricing(db: Session, data: PricingCreate) -> Pricing:
    pricing = Pricing(**data.model_dump())
    db.add(pricing)
    db.commit()
    db.refresh(pricing)
    return pricing


def get_pricing(db: Session, pricing_id: uuid.UUID) -> Pricing | None:
    return db.get(Pricing, pricing_id)


def list_pricing(db: Session, skip: int = 0, limit: int = 100) -> list[Pricing]:
    return list(db.execute(select(Pricing).offset(skip).limit(limit)).scalars().all())


def update_pricing(db: Session, pricing: Pricing, data: PricingUpdate) -> Pricing:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pricing, field, value)
    db.commit()
    db.refresh(pricing)
    return pricing


def delete_pricing(db: Session, pricing: Pricing) -> None:
    db.delete(pricing)
    db.commit()
