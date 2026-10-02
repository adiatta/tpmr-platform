import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.websocket_manager import publish_position
from app.crud import driver as driver_crud
from app.db.session import get_db
from app.models.driver import Driver
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverOut, DriverPositionUpdate, DriverUpdate

router = APIRouter(prefix="/drivers", tags=["drivers"])


class PushTokenUpdate(BaseModel):
    push_token: str


@router.post("", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> DriverOut:
    return driver_crud.create_driver(db, payload)


@router.get("", response_model=list[DriverOut])
def list_drivers(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[DriverOut]:
    return driver_crud.list_drivers(db, skip, limit)


@router.get("/me", response_model=DriverOut)
def get_my_driver_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> DriverOut:
    """Renvoie le profil CHAUFFEUR (table drivers, avec son propre id) du
    compte actuellement connecté — distinct de GET /auth/me qui renvoie le
    compte UTILISATEUR (table users). L'app mobile doit appeler CET
    endpoint après connexion, pas /auth/me, pour obtenir le driver_id
    correct à utiliser partout ailleurs (courses, messages, position GPS).

    IMPORTANT : cette route doit être déclarée AVANT /{driver_id} dans ce
    fichier, sinon FastAPI essaiera de parser "me" comme un UUID et
    renverra une erreur 422 au lieu d'atteindre cette fonction.
    """
    driver = db.execute(select(Driver).where(Driver.user_id == current_user.id)).scalars().first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun profil chauffeur associé à ce compte (compte admin ?)",
        )
    return driver


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> DriverOut:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    return driver


@router.patch("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: uuid.UUID,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> DriverOut:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    return driver_crud.update_driver(db, driver, payload)


@router.post("/{driver_id}/position", response_model=DriverOut)
async def update_position(
    driver_id: uuid.UUID,
    payload: DriverPositionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DriverOut:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    updated = driver_crud.update_driver_position(db, driver, payload.latitude, payload.longitude)
    await publish_position(str(driver_id), payload.latitude, payload.longitude)
    return updated


@router.post("/{driver_id}/offline", response_model=DriverOut)
async def set_offline(
    driver_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> DriverOut:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    return driver_crud.set_driver_offline(db, driver)


@router.post("/{driver_id}/push-token", response_model=DriverOut)
def register_push_token(
    driver_id: uuid.UUID,
    payload: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DriverOut:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    return driver_crud.set_push_token(db, driver, payload.push_token)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> None:
    driver = driver_crud.get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Chauffeur introuvable")
    try:
        driver_crud.delete_driver(db, driver)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer ce chauffeur : des courses lui sont encore "
            "rattachées. Réassignez ou supprimez d'abord ces courses.",
        ) from None
