"""Diffusion temps réel : positions GPS des chauffeurs et notifications.

Deux niveaux :
- `ConnectionManager` : garde les WebSocket ouverts par ce worker (dashboard
  admin abonné à la carte, éventuellement plusieurs onglets/instances).
- Redis pub/sub : permet de diffuser un événement à TOUS les workers backend.
"""

import asyncio
import json
import logging
from typing import Any

import redis.asyncio as redis
from fastapi import WebSocket

from app.core.config import settings

logger = logging.getLogger("tpmr.realtime")

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
    """Appelé par POST /drivers/{id}/position. IMPORTANT : si Redis est
    indisponible, on log l'erreur mais on NE FAIT PAS échouer la requête —
    la position est déjà enregistrée en base à ce stade (cf. l'endpoint),
    seule la diffusion temps réel est perdue, pas la fonctionnalité
    principale."""
    message = {"type": "position", "driver_id": driver_id, "latitude": latitude, "longitude": longitude}
    try:
        await get_redis().publish(POSITIONS_CHANNEL, json.dumps(message))
    except Exception:
        logger.warning("Échec de publication Redis (position) — Redis est-il démarré ?", exc_info=True)
    await positions_manager.broadcast(message)


async def publish_notification(user_id: str, title: str, body: str) -> None:
    """Même principe : ne bloque jamais l'action principale (envoi de
    message, changement de statut de course) si Redis est indisponible."""
    message = {"type": "notification", "user_id": user_id, "title": title, "body": body}
    try:
        await get_redis().publish(NOTIFICATIONS_CHANNEL, json.dumps(message))
    except Exception:
        logger.warning("Échec de publication Redis (notification) — Redis est-il démarré ?", exc_info=True)
    await notifications_manager.broadcast(message)


async def redis_listener() -> None:
    """Tâche de fond : relaie les messages des AUTRES workers vers les
    WebSocket de CE worker. Si Redis est indisponible au démarrage, on
    réessaie en boucle avec un backoff plutôt que de planter une fois pour
    toutes (avant : une seule tentative, échec silencieux définitif)."""
    delay = 2
    while True:
        try:
            pubsub = get_redis().pubsub()
            await pubsub.subscribe(POSITIONS_CHANNEL, NOTIFICATIONS_CHANNEL)
            logger.info("Connecté à Redis pub/sub — relais temps réel actif.")
            delay = 2  # reset après une connexion réussie
            async for message in pubsub.listen():
                if message["type"] != "message":
                    continue
                data = json.loads(message["data"])
                if message["channel"] == POSITIONS_CHANNEL:
                    await positions_manager.broadcast(data)
                else:
                    await notifications_manager.broadcast(data)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.warning(
                f"Connexion Redis perdue/indisponible — nouvelle tentative dans {delay}s. "
                "Vérifiez que Redis tourne (`docker compose up -d redis` depuis infra/).",
                exc_info=True,
            )
            await asyncio.sleep(delay)
            delay = min(delay * 2, 30)


def start_redis_listener() -> asyncio.Task:
    return asyncio.create_task(redis_listener())