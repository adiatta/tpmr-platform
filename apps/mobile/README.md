# TPMR — App Chauffeur (Expo SDK 57 / React Native 0.86 / React 19)

## Démarrage

Ce module fait partie du monorepo pnpm — installez tout depuis la racine :

```bash
# depuis la racine du monorepo
pnpm install
pnpm --filter @tpmr/mobile start
```

Scanner le QR code avec Expo Go, ou lancer sur simulateur (`i` iOS, `a` Android).

L'URL de l'API backend est définie dans `app.json` → `expo.extra.apiUrl`
(par défaut `http://localhost:8000/api/v1`). Sur un appareil physique, remplacez
`localhost` par l'IP locale de votre machine.

## Note sur les versions Tailwind / NativeWind

Le dashboard web (module Next.js) utilise **Tailwind CSS v4**. NativeWind v4,
lui, s'appuie en interne sur le moteur **Tailwind CSS v3** pour la génération
de classes React Native — `tailwind.config.js` (format v3) reste donc le bon
format ici, même si le reste du monorepo est en v4. C'est une contrainte de
NativeWind, pas une incohérence du projet : les deux configs partagent la
même palette de couleurs (copiée depuis les tokens `@theme` du dashboard) pour
garder une identité visuelle identique entre les deux apps.

## Identité visuelle

Même palette que le dashboard : teal `#0F5C5C` (primaire), ambre `#E8A33D`
(statuts intermédiaires), vert `#2F8F5B` (terminé), corail `#E2665A`
(annulé/incident).

## Écrans livrés

| Écran | Route | Détail |
|---|---|---|
| Splash | `/splash` | Affiché pendant l'hydratation de la session |
| Connexion | `/(auth)/login` | RHF + Zod, authentifie contre `POST /auth/login` |
| Mot de passe oublié | `/(auth)/forgot-password` | Formulaire de contact dispatch |
| Accueil | `/(tabs)/home` | Bascule en ligne/hors ligne, stats du jour, prochaine course |
| Mes courses | `/(tabs)/courses` | Liste filtrable (Toutes / En cours / Terminées) |
| Détail course | `/(tabs)/courses/[id]` | Adresses, ETA, Google Maps/Waze/Plans, action de statut |
| Carte GPS | `/(tabs)/map` | `react-native-maps`, marqueurs départ/arrivée |

Placeholders (fonctionnels a minima, à enrichir) : Historique, Messagerie,
Profil (fonctionnel), Paramètres, Notifications.

## Points clés d'implémentation

- **`stores/auth-store.ts`** (Zustand) : session persistée via AsyncStorage,
  hydratée au lancement par `AuthGate` dans `app/_layout.tsx`.
- **`services/location-tracking.ts`** : partage GPS vers `POST /drivers/{id}/position`.
- **`services/navigation.ts`** : ouvre Google Maps, Waze, ou Apple Plans (iOS).
- **`lib/types.ts` → `NEXT_ACTION`** : un seul bouton d'action à la fois, aligné
  sur `ALLOWED_TRANSITIONS` côté backend.
- **`@tpmr/shared-types`** : types de base (`Ride`, `Driver`, `Child`, statuts)
  importés depuis le package du monorepo, étendus localement si besoin.

## Prochaines étapes

Notifications push, messagerie temps réel (WebSocket), calendrier chauffeur,
signalement d'incident (bouton déjà en place, action à brancher).

## Tous les écrans sont livrés (14/14)

Splash, Connexion, Mot de passe oublié, Accueil, Mes courses, Détail course
(navigation Google Maps/Waze/Plans intégrée), Carte GPS, Historique,
Calendrier (`/calendar`, accessible depuis Accueil), Messagerie, Notifications,
Profil, Paramètres. Historique/Messagerie/Notifications/Paramètres restent
volontairement simples (données de démonstration ou fonctionnalité minimale) en
attendant les modules backend correspondants (messagerie temps réel,
notifications push).
