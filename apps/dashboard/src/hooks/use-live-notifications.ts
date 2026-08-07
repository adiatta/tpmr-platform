"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export interface LiveNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: number;
}

const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/notifications";

/** S'abonne à /api/v1/ws/notifications (module temps réel backend). Ne montre
 * que les notifications reçues depuis l'ouverture de cette page — il n'y a
 * pas encore d'historique persistant côté backend (à ajouter si besoin). */
export function useLiveNotifications() {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const retryDelay = useRef(1000);

  useEffect(() => {
    let socket: WebSocket;
    let cancelled = false;

    function connect() {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        setConnected(true);
        retryDelay.current = 1000;
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== "notification") return;
        setNotifications((prev) => [
          { id: crypto.randomUUID(), title: data.title, body: data.body, receivedAt: Date.now() },
          ...prev,
        ]);
      };

      socket.onclose = () => {
        setConnected(false);
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
  }, []);

  return { notifications, connected };
}
