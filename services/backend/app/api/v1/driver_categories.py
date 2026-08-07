import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.driver import DriverCategory
from app.models.user import User
from app.schemas.driver_category import DriverCategoryCreate, DriverCategoryOut

router = APIRouter(prefix="/driver-categories", tags=["driver-categories"])


@router.post("", response_model=DriverCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: DriverCategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> DriverCategory:
    category = DriverCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[DriverCategoryOut])
def list_categories(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[DriverCategory]:
    return list(db.execute(select(DriverCategory)).scalars().all())


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    category = db.get(DriverCategory, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    db.delete(category)
    db.commit()
