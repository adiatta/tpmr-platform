# TPMR Backend (FastAPI)

## Démarrage

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# éditer .env si besoin (DATABASE_URL, SECRET_KEY...)

# Première migration (une fois PostgreSQL démarré, ex. via docker-compose à la racine)
alembic revision --autogenerate -m "initial schema"
alembic upgrade head

uvicorn app.main:app --reload
```

L'API est disponible sur http://localhost:8000, la doc interactive sur http://localhost:8000/docs.

## Modules livrés

- **Auth** : login/refresh JWT, distinction rôles admin/chauffeur (`/api/v1/auth`)
- **Drivers** : CRUD chauffeurs + catégories + mise à jour de position GPS (`/api/v1/drivers`)
- **Children** : CRUD enfants (`/api/v1/children`)
- **Rides** : CRUD courses, machine à états des statuts, calcul ETA, calcul automatique
  du prix à la clôture d'une course (`/api/v1/rides`)
- **Temps réel** : `/api/v1/ws/positions` (carte GPS live du dashboard) et
  `/api/v1/ws/notifications` (changements de statut de course), relayés via Redis
  pub/sub pour fonctionner même avec plusieurs workers backend
  (`app/core/websocket_manager.py`)

### Fonctionnement du temps réel

1. L'app mobile appelle `POST /drivers/{id}/position` (toutes les ~10s pendant
   une course) → l'endpoint publie sur Redis (`tpmr:positions`) ET diffuse
   directement aux WebSocket ouverts sur ce worker.
2. Chaque worker backend tourne une tâche de fond (`redis_listener`, démarrée
   dans `lifespan` de `main.py`) qui relaie les messages des AUTRES workers
   vers ses propres WebSocket connectés — donc peu importe sur quel worker le
   dashboard admin est connecté, il reçoit toutes les positions.
3. Même mécanisme pour les notifications : `POST /rides/{id}/status` publie un
   message sur `tpmr:notifications` à chaque changement de statut.

**Limite connue à traiter avant la prod** : les WebSocket ne sont pas encore
authentifiés (pas de vérification du JWT à la connexion) et diffusent à tous
les clients connectés plutôt que de filtrer par `user_id` — acceptable pour un
MVP à 8 chauffeurs, à corriger avant d'ouvrir l'app à plus d'utilisateurs.

## Points d'extension prévus (prochains modules)

- `app/services/billing_service.py` + `app/services/pdf_generator.py` : facturation
  automatique et génération de PDF (reportlab est déjà dans requirements.txt)
- `app/services/geo_service.py` : `compute_route()` utilise actuellement une estimation
  à vol d'oiseau — à remplacer par un vrai appel Google Maps / Mapbox / OSRM
- `app/models/institution.py` + endpoints `/api/v1/institutions` : CRUD établissements
  (modèle déjà créé, endpoints à ajouter sur le même patron que `children.py`)
- `app/api/v1/messages.py`, `notifications.py`, `reports.py`, `pricing.py` (endpoints
  CRUD pour la grille tarifaire — le modèle `Pricing` et son service existent déjà)

## Notes d'architecture

- Chaque `Driver` est lié à un `User` (rôle `driver`) : l'authentification est centralisée
  sur `users`, les infos métier (véhicule, position...) restent sur `drivers`.
- Les transitions de statut d'une course sont validées côté serveur via
  `ALLOWED_TRANSITIONS` dans `app/models/ride.py` — impossible de sauter une étape
  depuis l'app mobile ou le dashboard.
- Le prix est calculé automatiquement quand une course passe à `Terminée`, via
  `pricing_service.resolve_pricing()` qui applique le tarif le plus spécifique
  (enfant > établissement > global).
