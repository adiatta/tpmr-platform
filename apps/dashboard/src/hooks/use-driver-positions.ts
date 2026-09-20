"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface DriverPosition {
  driver_id: string;
  latitude: number;
  longitude: number;
  updated_at: number;
}

const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/positions";

/** S'abonne à /api/v1/ws/positions (module WebSocket backend) et maintient
 * une map { driver_id: dernière position connue } à jour en temps réel.
 * Reconnexion automatique avec backoff en cas de coupure. */
export function useDriverPositions() {
  const [positions, setPositions] = useState<Record<string, DriverPosition>>({});
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
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "position") return;
          setPositions((prev) => ({
            ...prev,
            [data.driver_id]: {
              driver_id: data.driver_id,
              latitude: data.latitude,
              longitude: data.longitude,
              updated_at: Date.now(),
            },
          }));
        } catch {
          // message inattendu, on ignore
        }
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

  return { positions: Object.values(positions), connected };
}