import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.crud import pricing as pricing_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.pricing import (
    PricingCreate,
    PricingOut,
    PricingSimulationRequest,
    PricingSimulationResult,
    PricingUpdate,
)
from app.services import pricing_service

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.post("", response_model=PricingOut, status_code=status.HTTP_201_CREATED)
def create_pricing(
    payload: PricingCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> PricingOut:
    return pricing_crud.create_pricing(db, payload)


@router.get("", response_model=list[PricingOut])
def list_pricing(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[PricingOut]:
    return pricing_crud.list_pricing(db, skip, limit)


@router.get("/{pricing_id}", response_model=PricingOut)
def get_pricing(
    pricing_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> PricingOut:
    pricing = pricing_crud.get_pricing(db, pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Tarif introuvable")
    return pricing


@router.patch("/{pricing_id}", response_model=PricingOut)
def update_pricing(
    pricing_id: uuid.UUID,
    payload: PricingUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> PricingOut:
    pricing = pricing_crud.get_pricing(db, pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Tarif introuvable")
    return pricing_crud.update_pricing(db, pricing, payload)


@router.delete("/{pricing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pricing(
    pricing_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    pricing = pricing_crud.get_pricing(db, pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Tarif introuvable")
    pricing_crud.delete_pricing(db, pricing)


@router.post("/simulate", response_model=PricingSimulationResult)
def simulate_pricing(
    payload: PricingSimulationRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PricingSimulationResult:
    """Utilisé par le simulateur rapide de la page /pricing du dashboard —
    applique le même service que celui utilisé à la clôture réelle d'une course
    (app/services/pricing_service.py), donc le résultat affiché à l'admin est
    garanti identique à ce qui sera facturé."""
    rule = pricing_service.resolve_pricing(
        db, child_id=payload.child_id, institution_id=payload.institution_id
    )
    price = pricing_service.compute_price(rule, payload.distance_km)
    return PricingSimulationResult(price=price, pricing_rule_used=rule.name if rule else None)
