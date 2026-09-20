import * as Location from "expo-location";
import { api } from "@/services/api";

let watchSubscription: Location.LocationSubscription | null = null;
let currentDriverId: string | null = null;

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/** Démarre le partage de position vers le backend (toutes les ~10s ou 30m de
 * déplacement) — appelé automatiquement dès que le chauffeur est connecté
 * et que l'app est au premier plan (plus de bascule manuelle, cf.
 * hooks/use-auto-online.ts). */
export async function startSharingPosition(driverId: string) {
  if (watchSubscription) return;
  currentDriverId = driverId;

  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 30,
    },
    (location) => {
      api
        .updatePosition(driverId, location.coords.latitude, location.coords.longitude)
        .catch(() => {
          // échec silencieux : la prochaine mise à jour réessaiera automatiquement
        });
    },
  );
}

export function stopSharingPosition() {
  watchSubscription?.remove();
  watchSubscription = null;

  // Marque le chauffeur hors ligne côté backend dès que le partage
  // s'arrête (app en arrière-plan ou déconnexion) — jusqu'ici is_online
  // ne repassait jamais à false, d'où le statut figé côté dashboard.
  if (currentDriverId) {
    api.markOffline(currentDriverId).catch(() => {});
    currentDriverId = null;
  }
}

export function isSharingPosition(): boolean {
  return watchSubscription !== null;
}
