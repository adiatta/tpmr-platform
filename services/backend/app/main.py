from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.websocket_manager import start_redis_listener


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Relaie en tâche de fond les messages Redis pub/sub (positions GPS,
    # notifications) publiés par les autres workers vers les WebSocket
    # ouverts sur CE worker — cf. app/core/websocket_manager.py
    listener_task = start_redis_listener()
    yield
    listener_task.cancel()


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
