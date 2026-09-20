"""Envoi de notifications push via le service Expo (exp.host) — fonctionne
avec n'importe quelle app buildée avec Expo, sans compte Firebase/Apple
Developer distinct à configurer pour un MVP.

Nécessite que le téléphone ait un token Expo Push enregistré (cf.
POST /drivers/{id}/push-token, appelé automatiquement par l'app mobile
après connexion — voir services/push-notifications.ts côté mobile).
"""

import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push_notification(push_token: str, title: str, body: str) -> None:
    if not push_token:
        return
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            await client.post(
                EXPO_PUSH_URL,
                json={
                    "to": push_token,
                    "title": title,
                    "body": body,
                    "sound": "default",
                },
                headers={"Content-Type": "application/json"},
            )
        except httpx.HTTPError:
            # Échec silencieux : une notification push manquée n'est pas
            # critique (le WebSocket in-app reste la source de vérité tant
            # que l'app est ouverte) — pas la peine de faire échouer la
            # requête principale (changement de statut, envoi de message).
            pass
