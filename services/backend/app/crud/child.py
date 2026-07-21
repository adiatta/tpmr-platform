import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.child import Child
from app.schemas.child import ChildCreate, ChildUpdate


def create_child(db: Session, data: ChildCreate) -> Child:
    child = Child(**data.model_dump())
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


def get_child(db: Session, child_id: uuid.UUID) -> Child | None:
    return db.get(Child, child_id)


def list_children(db: Session, skip: int = 0, limit: int = 100) -> list[Child]:
    return list(db.execute(select(Child).offset(skip).limit(limit)).scalars().all())


def update_child(db: Session, child: Child, data: ChildUpdate) -> Child:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(child, field, value)
    db.commit()
    db.refresh(child)
    return child


def delete_child(db: Session, child: Child) -> None:
    db.delete(child)
    db.commit()
