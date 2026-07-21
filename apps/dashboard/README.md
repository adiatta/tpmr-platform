# TPMR Dashboard (Next.js 16 / React 19 / Tailwind v4)

## Démarrage

Ce module fait partie du monorepo pnpm — installez tout depuis la racine :

```bash
# depuis la racine du monorepo
pnpm install
cp apps/dashboard/.env.example apps/dashboard/.env.local
pnpm --filter @tpmr/dashboard dev   # http://localhost:3000
```

Le dashboard consomme l'API FastAPI (`services/backend`) via
`NEXT_PUBLIC_API_URL` (par défaut `http://localhost:8000/api/v1`).

## Changements liés aux versions

- **Next.js 16 / React 19** : App Router, Server Components par défaut — aucune
  page de ce module n'a besoin de React 19 spécifiquement, mais les hooks
  (`useState`, `useForm`...) restent dans des fichiers `"use client"`.
- **Tailwind CSS v4** : configuration "CSS-first" — il n'y a plus de
  `tailwind.config.ts`. Les tokens de couleur/typo sont définis directement dans
  `src/app/globals.css` via le bloc `@theme`. Le plugin PostCSS a changé :
  `@tailwindcss/postcss` (voir `postcss.config.js`).
- **Types partagés** : `src/lib/types.ts` réexporte désormais `@tpmr/shared-types`
  (package du monorepo), pour rester synchronisé avec l'app mobile.

## Identité visuelle

- **Couleurs** : teal profond `#0F5C5C` (primaire), ambre `#E8A33D` (statuts
  intermédiaires), vert `#2F8F5B` (terminé), corail `#E2665A` (annulé/incident).
  Fond frais et neutre (`#F4F8F8`).
- **Typographie** : Manrope (titres), Inter (texte courant), IBM Plex Mono
  (données tabulaires).
- **Élément signature** : `RideStatusTimeline` — visualise la progression réelle
  d'une course le long de sa machine à états (la même que `ALLOWED_TRANSITIONS`
  côté backend), pas une décoration générique.

## Pages livrées

| Page | Route | Notes |
|---|---|---|
| Connexion | `/login` | Authentifie contre `POST /auth/login` |
| Tableau de bord | `/` | KPIs, graphique courses/heure, alertes récentes |
| Chauffeurs | `/drivers` | Liste avec statut en ligne/hors ligne |
| Ajouter un chauffeur | `/drivers/new` | React Hook Form + Zod |
| Enfants | `/children` | Liste avec établissement et besoins spécifiques |
| Courses | `/rides` | Timeline de progression + badge de statut |

## Prochaines pages (mêmes patrons à réutiliser)

`drivers/[id]/edit`, `drivers/categories`, `children/new`, `children/[id]/edit`,
`institutions`, `rides/new`, `planning`, `calendar`, `billing`, `pricing`,
`reports`, `messages`, `notifications`, `settings`, `profile`, `map`.
