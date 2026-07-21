"use client";

import { Radio, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDriverPositions } from "@/hooks/use-driver-positions";

export default function MapPage() {
  const { positions, connected } = useDriverPositions();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-danger"}`} />
        <p className="text-sm text-muted">
          {connected ? "Connecté au flux temps réel" : "Connexion au flux temps réel..."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Emplacement de la carte réelle (Google Maps / Mapbox) — à intégrer avec
            un provider de tuiles ; en attendant, la liste ci-contre reflète déjà
            le flux WebSocket réel (POST /drivers/{id}/position → /ws/positions). */}
        <Card className="flex h-[480px] items-center justify-center lg:col-span-2">
          <div className="text-center text-sm text-muted">
            <Navigation className="mx-auto mb-2" size={24} />
            Intégration carte (Google Maps / Mapbox) à brancher ici — les
            coordonnées temps réel sont déjà disponibles via `useDriverPositions()`.
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chauffeurs en ligne</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {positions.length === 0 && (
              <p className="text-sm text-muted">Aucune position reçue pour le moment.</p>
            )}
            {positions.map((p) => (
              <div key={p.driver_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-success" />
                  <span className="font-mono text-xs text-muted">{p.driver_id.slice(0, 8)}</span>
                </div>
                <span className="font-mono text-xs text-muted">
                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
