from fastapi import APIRouter

from app.api.v1 import (
    auth,
    children,
    driver_categories,
    drivers,
    institutions,
    messages,
    pricing,
    rides,
    websocket,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(drivers.router)
api_router.include_router(driver_categories.router)
api_router.include_router(children.router)
api_router.include_router(rides.router)
api_router.include_router(institutions.router)
api_router.include_router(pricing.router)
api_router.include_router(messages.router)
api_router.include_router(websocket.router)
