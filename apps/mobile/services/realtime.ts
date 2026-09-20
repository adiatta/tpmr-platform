import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";

const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/notifications";

/** Composant sans rendu, monté une seule fois dans app/_layout.tsx.
 * Se connecte au même canal WebSocket que le dashboard (/ws/notifications,
 * cf. module temps réel backend). Chaque message reçu — qu'il vienne d'un
 * changement de statut de course (POST /rides/{id}/status) ou d'un nouveau
 * message (POST /messages/{driver_id}) — invalide les requêtes React Query
 * concernées, donc les écrans "Mes courses", "Accueil" et "Messagerie" se
 * rafraîchissent automatiquement, sans que le chauffeur ait à tirer pour
 * rafraîchir. */
export function RealtimeSync() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const retryDelay = useRef(1000);

  useEffect(() => {
    if (!token) return; // pas de session → rien à synchroniser

    let socket: WebSocket;
    let cancelled = false;

    function connect() {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        retryDelay.current = 1000;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "notification") return;

          // On invalide largement plutôt que de parser finement le contenu
          // du message — plus simple et robuste, le coût d'un refetch en
          // trop est négligeable comparé à rater une mise à jour.
          queryClient.invalidateQueries({ queryKey: ["rides"] });
          queryClient.invalidateQueries({ queryKey: ["ride"] });
          queryClient.invalidateQueries({ queryKey: ["conversation"] });
        } catch {
          // message non-JSON ou inattendu, on ignore
        }
      };

      socket.onclose = () => {
        if (!cancelled) {
          setTimeout(connect, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, 15000);
        }
      };
    }

    connect();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [token, queryClient]);

  return null;
}
