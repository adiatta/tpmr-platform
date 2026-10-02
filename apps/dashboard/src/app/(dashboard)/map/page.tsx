"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDriverPositions } from "@/hooks/use-driver-positions";
import { api } from "@/lib/api";
import { DriversMap } from "@/components/map/drivers-map";
import type { Driver } from "@/lib/types";

export default function MapPage() {
  const { positions, connected } = useDriverPositions();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    api.listDrivers().then(setDrivers).catch(() => {});
  }, []);

  function driverName(id: string) {
    return drivers.find((d) => d.id === id)?.full_name ?? `Chauffeur ${id.slice(0, 8)}`;
  }

  function isStale(updatedAt: number) {
    return Date.now() - updatedAt > 30000;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-danger"}`} />
        <p className="text-sm text-muted">
          {connected ? "Connecté au flux temps réel" : "Connexion au flux temps réel..."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden p-0">
          <DriversMap
            positions={positions}
            driverName={driverName}
            isStale={isStale}
            selectedDriverId={selectedDriverId}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chauffeurs en ligne ({positions.length})</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {positions.length === 0 && (
              <p className="text-sm text-muted">
                Aucune position reçue pour le moment — un chauffeur doit être connecté
                sur l&apos;app mobile avec le partage de position activé (bascule &quot;En ligne&quot;
                sur l&apos;écran Accueil).
              </p>
            )}
            {positions.map((p) => (
              <button
                key={p.driver_id}
                onClick={() => setSelectedDriverId(p.driver_id)}
                className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  selectedDriverId === p.driver_id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio size={14} className={isStale(p.updated_at) ? "text-muted" : "text-success"} />
                  <div>
                    <p className="text-sm font-medium">{driverName(p.driver_id)}</p>
                    <p className="font-mono text-xs text-muted">
                      {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted">
                  {isStale(p.updated_at) ? "En pause" : "À l'instant"}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}