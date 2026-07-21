# TPMR Platform — Monorepo

Plateforme de gestion de transport de personnes à mobilité réduite (TPMR),
spécialisée dans le transport d'enfants en situation de handicap.

## Stack (versions figées, compatibles entre elles)

| Composant | Version |
|---|---|
| pnpm | 11 |
| Turborepo | 2 |
| Next.js (dashboard) | 16 |
| React (dashboard) | 19 |
| Tailwind CSS (dashboard) | v4 |
| Expo SDK (mobile) | 57 |
| React Native (mobile) | 0.86 |
| React (mobile) | 19 |
| NativeWind (mobile) | v4 |
| FastAPI (backend) | dernière stable |
| PostgreSQL | 16 |

## Structure

```
tpmr-platform/
├── apps/
│   ├── dashboard/      # Next.js 16 — back-office admin
│   └── mobile/         # Expo 57 — app chauffeur
├── services/
│   └── backend/        # FastAPI — API + WebSockets
├── packages/
│   └── shared-types/   # Types TS partagés dashboard ↔ mobile
├── infra/               # Docker, docker-compose, .env.example
└── docs/
```

## Démarrage rapide

```bash
corepack enable
corepack prepare pnpm@11.0.0 --activate

pnpm install

# Backend (dans un terminal séparé — projet Python indépendant, cf. services/backend/README.md)
cd services/backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && alembic upgrade head
uvicorn app.main:app --reload

# Dashboard + mobile (depuis la racine, une fois pnpm install fait)
pnpm --filter @tpmr/dashboard dev
pnpm --filter @tpmr/mobile start
```

Ou tout via Docker Compose (backend + dashboard + Postgres + Redis) :

```bash
cd infra && cp .env.example .env && docker compose up -d --build
```

## Pourquoi ce découpage

- **pnpm workspaces + Turborepo 2** gèrent `apps/dashboard`, `apps/mobile` et
  `packages/shared-types` dans un seul arbre de dépendances JS/TS, avec cache de
  build et exécution parallèle des tâches (`pnpm build` orchestré par Turbo).
- **`packages/shared-types`** est la source unique de vérité pour les types
  métier (`Ride`, `Driver`, `Child`, statuts de course) — un changement de schéma
  côté backend qui casse un type se voit immédiatement en erreur de compilation
  côté dashboard et mobile, pas en bug de prod.
- **`services/backend`** reste un projet Python autonome (pas dans les workspaces
  pnpm) : sa gestion de dépendances (pip/venv) n'a pas à interférer avec
  l'écosystème JS. Docker Compose orchestre les deux mondes ensemble.

## Modules livrés

| Module | Contenu | README |
|---|---|---|
| Architecture & structure | ce document + arborescence | — |
| Backend | modèles, auth JWT, endpoints Drivers/Children/Rides, calcul prix/ETA | `services/backend/README.md` |
| Dashboard | Connexion, Tableau de bord, Chauffeurs, Enfants, Courses | `apps/dashboard/README.md` |
| Mobile | Connexion, Accueil, Mes courses, détail course, Carte GPS | `apps/mobile/README.md` |

## Prochaines étapes

WebSocket temps réel (GPS + messagerie), facturation automatique + PDF,
endpoints Établissements/Tarifs, notifications push.
