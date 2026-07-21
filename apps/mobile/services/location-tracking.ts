import * as Location from "expo-location";
import { api } from "@/services/api";

let watchSubscription: Location.LocationSubscription | null = null;

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/** Démarre le partage de position vers le backend (toutes les ~10s ou 30m de
 * déplacement). Le backend republie la position sur Redis pub/sub pour la
 * carte temps réel du dashboard (cf. module 1, endpoint /drivers/{id}/position). */
export async function startSharingPosition(driverId: string) {
  if (watchSubscription) return;

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
}
