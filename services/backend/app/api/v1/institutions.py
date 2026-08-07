import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.crud import institution as institution_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.institution import InstitutionCreate, InstitutionOut, InstitutionUpdate

router = APIRouter(prefix="/institutions", tags=["institutions"])


@router.post("", response_model=InstitutionOut, status_code=status.HTTP_201_CREATED)
def create_institution(
    payload: InstitutionCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> InstitutionOut:
    return institution_crud.create_institution(db, payload)


@router.get("", response_model=list[InstitutionOut])
def list_institutions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[InstitutionOut]:
    return institution_crud.list_institutions(db, skip, limit)


@router.get("/{institution_id}", response_model=InstitutionOut)
def get_institution(
    institution_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> InstitutionOut:
    institution = institution_crud.get_institution(db, institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Établissement introuvable")
    return institution


@router.patch("/{institution_id}", response_model=InstitutionOut)
def update_institution(
    institution_id: uuid.UUID,
    payload: InstitutionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> InstitutionOut:
    institution = institution_crud.get_institution(db, institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Établissement introuvable")
    return institution_crud.update_institution(db, institution, payload)


@router.delete("/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_institution(
    institution_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    institution = institution_crud.get_institution(db, institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Établissement introuvable")
    institution_crud.delete_institution(db, institution)
