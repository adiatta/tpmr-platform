import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "@/stores/auth-store";
import {
  requestLocationPermission,
  startSharingPosition,
  stopSharingPosition,
} from "@/services/location-tracking"; 

/** Remplace l'ancienne bascule manuelle "En ligne" — le partage de position
 * démarre tout seul dès que le chauffeur est connecté ET que l'app est au
 * premier plan, et s'arrête (avec passage explicite à "hors ligne" côté
 * backend, cf. POST /drivers/{id}/offline) dès qu'elle passe en arrière-plan
 * ou que le chauffeur se déconnecte. Un chauffeur ouvert sur l'app = en
 * ligne, point — plus besoin d'y penser. */
export function useAutoOnlineStatus() {
  const driver = useAuthStore((s) => s.driver);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!driver?.id) {
      stopSharingPosition();
      setIsOnline(false);
      return;
    }

    let mounted = true;

    async function goOnline() {
      const granted = await requestLocationPermission();
      if (!granted || !mounted) return;
      await startSharingPosition(driver!.id);
      if (mounted) setIsOnline(true);
    }

    goOnline();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        goOnline();
      } else {
        stopSharingPosition();
        setIsOnline(false);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
      stopSharingPosition();
      setIsOnline(false);
    };
  }, [driver?.id]);

  return isOnline;
}
