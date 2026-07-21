from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.pricing import Pricing


def resolve_pricing(db: Session, child_id, institution_id) -> Pricing | None:
    """Le tarif le plus spécifique l'emporte : enfant > établissement > global."""
    if child_id:
        stmt = select(Pricing).where(Pricing.child_id == child_id)
        pricing = db.execute(stmt).scalars().first()
        if pricing:
            return pricing

    if institution_id:
        stmt = select(Pricing).where(Pricing.institution_id == institution_id)
        pricing = db.execute(stmt).scalars().first()
        if pricing:
            return pricing

    stmt = select(Pricing).where(Pricing.child_id.is_(None), Pricing.institution_id.is_(None))
    return db.execute(stmt).scalars().first()


def compute_price(pricing: Pricing | None, distance_km: float) -> float:
    if pricing is None:
        return 0.0

    price = pricing.base_fee + pricing.price_per_km * distance_km

    if distance_km > pricing.long_distance_threshold_km:
        price *= 1 + pricing.long_distance_surcharge_pct / 100

    return round(price, 2)
