import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { focusManager, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";

const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/notifications";

/** Composant sans rendu, monté une seule fois dans app/_layout.tsx.
 * Se connecte au même canal WebSocket que le dashboard (/ws/notifications).
 * Chaque message reçu invalide les requêtes React Query concernées, donc les
 * écrans "Mes courses", "Accueil" et "Messagerie" se rafraîchissent
 * automatiquement.
 *
 * Deux filets de sécurité en plus du WebSocket :
 *  - à chaque (re)connexion du socket, on rafraîchit tout, pour rattraper ce
 *    qui a pu arriver pendant une coupure réseau ;
 *  - quand l'app revient au premier plan, React Query refetch les données
 *    périmées (il faut lui brancher AppState, il ne le fait pas seul en RN). */
export function RealtimeSync() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const retryDelay = useRef(1000);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!token) return; // pas de session → rien à synchroniser

    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function refreshAll() {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["ride"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    }

    function connect() {
      if (cancelled) return;

      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        retryDelay.current = 1000;
        refreshAll();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "notification") return;
          // On invalide largement plutôt que de parser finement le contenu :
          // un refetch en trop coûte peu, rater une mise à jour coûte cher.
          refreshAll();
        } catch {
          // message non-JSON ou inattendu, on ignore
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        retryTimer = setTimeout(connect, retryDelay.current);
        retryDelay.current = Math.min(retryDelay.current * 2, 15000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [token, queryClient]);

  return null;
}
