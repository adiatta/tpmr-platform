"""Diffusion temps réel : positions GPS des chauffeurs et notifications.

Deux niveaux :
- `ConnectionManager` : garde les WebSocket ouverts par ce worker (dashboard
  admin abonné à la carte, éventuellement plusieurs onglets/instances).
- Redis pub/sub : permet de diffuser un événement à TOUS les workers backend
  (utile dès qu'on tourne en plusieurs instances derrière un load balancer),
  pas seulement aux clients connectés à ce process-ci.
"""

import asyncio
import json
from typing import Any

import redis.asyncio as redis
from fastapi import WebSocket

from app.core.config import settings

POSITIONS_CHANNEL = "tpmr:positions"
NOTIFICATIONS_CHANNEL = "tpmr:notifications"


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        payload = json.dumps(message)
        for connection in self._connections:
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


positions_manager = ConnectionManager()
notifications_manager = ConnectionManager()

_redis_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


async def publish_position(driver_id: str, latitude: float, longitude: float) -> None:
    """Appelé par l'endpoint POST /drivers/{id}/position (module backend).
    Publie sur Redis (pour les autres workers) ET diffuse localement tout de
    suite (pour ne pas attendre l'aller-retour Redis sur ce même worker)."""
    message = {"type": "position", "driver_id": driver_id, "latitude": latitude, "longitude": longitude}
    await get_redis().publish(POSITIONS_CHANNEL, json.dumps(message))
    await positions_manager.broadcast(message)


async def publish_notification(user_id: str, title: str, body: str) -> None:
    message = {"type": "notification", "user_id": user_id, "title": title, "body": body}
    await get_redis().publish(NOTIFICATIONS_CHANNEL, json.dumps(message))
    await notifications_manager.broadcast(message)


async def redis_listener() -> None:
    """Tâche de fond (démarrée au lancement de l'app, cf. main.py) : relaie les
    messages publiés par les AUTRES workers vers les WebSocket de CE worker."""
    pubsub = get_redis().pubsub()
    await pubsub.subscribe(POSITIONS_CHANNEL, NOTIFICATIONS_CHANNEL)
    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        data = json.loads(message["data"])
        if message["channel"] == POSITIONS_CHANNEL:
            await positions_manager.broadcast(data)
        else:
            await notifications_manager.broadcast(data)


def start_redis_listener() -> asyncio.Task:
    return asyncio.create_task(redis_listener())
