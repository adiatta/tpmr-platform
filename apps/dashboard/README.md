# TPMR Dashboard (Next.js 16 / React 19 / Tailwind v4)

## Démarrage

```bash
# depuis la racine du monorepo
pnpm install
cp apps/dashboard/.env.example apps/dashboard/.env.local
pnpm --filter @tpmr/dashboard dev   # http://localhost:3000
```

## Toutes les pages sont livrées (22/22)

| Page | Route |
|---|---|
| Connexion | `/login` |
| Tableau de bord | `/` |
| Carte GPS (temps réel, WebSocket) | `/map` |
| Chauffeurs | `/drivers` |
| Ajouter un chauffeur | `/drivers/new` |
| Modifier un chauffeur | `/drivers/[id]/edit` |
| Catégories de chauffeurs | `/drivers/categories` |
| Enfants | `/children` |
| Ajouter un enfant | `/children/new` |
| Modifier un enfant | `/children/[id]/edit` |
| Établissements | `/institutions` |
| Courses | `/rides` |
| Nouvelle course | `/rides/new` |
| Planning | `/planning` |
| Calendrier | `/calendar` |
| Facturation | `/billing` |
| Tarifs | `/pricing` |
| Rapports | `/reports` |
| Messagerie | `/messages` |
| Notifications | `/notifications` |
| Paramètres | `/settings` |
| Profil | `/profile` |

## Pages branchées sur l'API réelle

Chauffeurs (liste + ajout + modification), Enfants (liste + ajout + modification),
Courses (liste + création), Établissements, Tarifs (+ simulateur) — toutes
appellent réellement le backend via `src/lib/api.ts`, plus de données figées.

Il faut un compte admin pour se connecter (`python -m scripts.seed_admin`,
cf. README backend) — c'est lui qui permet de créer les chauffeurs, qui se
connectent ensuite sur l'app mobile avec le même email/mot de passe.

## Pages encore sur données de démonstration

Catégories de chauffeurs (modèle `DriverCategory` existe côté backend, pas
encore d'endpoints CRUD), Planning, Calendrier, Facturation, Rapports,
Messagerie, Notifications, Paramètres, Profil — en attente des modules
backend correspondants (facturation, messagerie) ou de endpoints
d'agrégation (planning/rapports peuvent déjà être dérivés de `GET /rides`,
juste pas encore branchés).

## Identité visuelle

- **Couleurs** : teal profond `#0F5C5C` (primaire), ambre `#E8A33D` (statuts
  intermédiaires), vert `#2F8F5B` (terminé), corail `#E2665A` (annulé/incident).
- **Typographie** : Manrope (titres), Inter (texte courant), IBM Plex Mono
  (données tabulaires).
- **Tailwind v4** : configuration CSS-first via `@theme` dans `globals.css`,
  pas de `tailwind.config.ts`.
- **Élément signature** : `RideStatusTimeline` — visualise la progression
  réelle d'une course le long de sa machine à états (la même que
  `ALLOWED_TRANSITIONS` côté backend).

## Prochaines étapes (cf. feuille de route)

Facturation réelle (modèle `Invoice` + génération PDF), messagerie réelle
(modèle `Message` + WebSocket dédié), intégration carte réelle (Google
Maps/Mapbox) sur `/map`, endpoints `/institutions` et `/pricing`.
