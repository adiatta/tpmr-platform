import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.crud import child as child_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.child import ChildCreate, ChildOut, ChildUpdate

router = APIRouter(prefix="/children", tags=["children"])


@router.post("", response_model=ChildOut, status_code=status.HTTP_201_CREATED)
def create_child(
    payload: ChildCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> ChildOut:
    return child_crud.create_child(db, payload)


@router.get("", response_model=list[ChildOut])
def list_children(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[ChildOut]:
    return child_crud.list_children(db, skip, limit)


@router.get("/{child_id}", response_model=ChildOut)
def get_child(
    child_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> ChildOut:
    child = child_crud.get_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Enfant introuvable")
    return child


@router.patch("/{child_id}", response_model=ChildOut)
def update_child(
    child_id: uuid.UUID,
    payload: ChildUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> ChildOut:
    child = child_crud.get_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Enfant introuvable")
    return child_crud.update_child(db, child, payload)


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(
    child_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    child = child_crud.get_child(db, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Enfant introuvable")
    child_crud.delete_child(db, child)
