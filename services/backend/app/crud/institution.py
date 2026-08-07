import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate, InstitutionUpdate


def create_institution(db: Session, data: InstitutionCreate) -> Institution:
    institution = Institution(**data.model_dump())
    db.add(institution)
    db.commit()
    db.refresh(institution)
    return institution


def get_institution(db: Session, institution_id: uuid.UUID) -> Institution | None:
    return db.get(Institution, institution_id)


def list_institutions(db: Session, skip: int = 0, limit: int = 100) -> list[Institution]:
    return list(db.execute(select(Institution).offset(skip).limit(limit)).scalars().all())


def update_institution(db: Session, institution: Institution, data: InstitutionUpdate) -> Institution:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(institution, field, value)
    db.commit()
    db.refresh(institution)
    return institution


def delete_institution(db: Session, institution: Institution) -> None:
    db.delete(institution)
    db.commit()
