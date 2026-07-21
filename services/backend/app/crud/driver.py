import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.driver import Driver
from app.models.user import User, UserRole
from app.schemas.driver import DriverCreate, DriverUpdate


def create_driver(db: Session, data: DriverCreate) -> Driver:
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.DRIVER,
    )
    db.add(user)
    db.flush()  # récupère user.id sans commit

    driver = Driver(
        user_id=user.id,
        phone=data.phone,
        category_id=data.category_id,
        vehicle_plate=data.vehicle_plate,
        vehicle_model=data.vehicle_model,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def get_driver(db: Session, driver_id: uuid.UUID) -> Driver | None:
    return db.get(Driver, driver_id)


def list_drivers(db: Session, skip: int = 0, limit: int = 100) -> list[Driver]:
    return list(db.execute(select(Driver).offset(skip).limit(limit)).scalars().all())


def update_driver(db: Session, driver: Driver, data: DriverUpdate) -> Driver:
    update_data = data.model_dump(exclude_unset=True, exclude={"is_active"})
    for field, value in update_data.items():
        setattr(driver, field, value)
    if data.full_name is not None:
        driver.user.full_name = data.full_name
    if data.is_active is not None:
        driver.user.is_active = data.is_active
    db.commit()
    db.refresh(driver)
    return driver


def update_driver_position(db: Session, driver: Driver, lat: float, lng: float) -> Driver:
    driver.current_latitude = lat
    driver.current_longitude = lng
    driver.last_position_at = datetime.utcnow()
    driver.is_online = True
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver: Driver) -> None:
    db.delete(driver)
    db.commit()
