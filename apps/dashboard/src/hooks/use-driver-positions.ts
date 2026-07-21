"use client";

import { useEffect, useRef, useState } from "react";

interface DriverPosition {
  driver_id: string;
  latitude: number;
  longitude: number;
  updated_at: number;
}

const WS_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/^http/, "ws") +
  "/ws/positions";

/** S'abonne à POST /api/v1/ws/positions (module WebSocket backend) et maintient
 * une map { driver_id: dernière position connue } à jour en temps réel.
 * Reconnexion automatique avec backoff simple en cas de coupure. */
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
        const data = JSON.parse(event.data);
        if (data.type !== "position") return;
        setPositions((prev) => ({
          ...prev,
          [data.driver_id]: { ...data, updated_at: Date.now() },
        }));
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
