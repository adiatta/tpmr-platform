from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import notifications_manager, positions_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/positions")
async def ws_positions(websocket: WebSocket) -> None:
    """Le dashboard admin s'abonne ici pour recevoir la position de tous les
    chauffeurs en temps réel (carte GPS, page /map). Chaque message reçu par
    le client a la forme :
        {"type": "position", "driver_id": "...", "latitude": ..., "longitude": ...}
    """
    await positions_manager.connect(websocket)
    try:
        while True:
            # Ce canal est purement descendant (serveur → client) ; on lit quand
            # même les messages entrants pour détecter la déconnexion au plus tôt.
            await websocket.receive_text()
    except WebSocketDisconnect:
        positions_manager.disconnect(websocket)


@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket) -> None:
    """L'app mobile chauffeur ET le dashboard s'abonnent ici pour les
    notifications (nouvelle course assignée, changement de statut, message).
    En prod, on filtrerait par user_id (auth sur le WebSocket) plutôt que de
    tout diffuser à tout le monde — cf. note dans le README backend.
    """
    await notifications_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notifications_manager.disconnect(websocket)
