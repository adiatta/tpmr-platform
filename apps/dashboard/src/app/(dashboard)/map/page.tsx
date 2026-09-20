"use client";

import { useEffect, useState } from "react";
import { Radio, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDriverPositions } from "@/hooks/use-driver-positions";
import { api } from "@/lib/api";
import type { Driver } from "@/lib/types";

export default function MapPage() {
  const { positions, connected } = useDriverPositions();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    api.listDrivers().then(setDrivers).catch(() => {});
  }, []);

  function driverName(id: string) {
    return drivers.find((d) => d.id === id)?.full_name ?? `Chauffeur ${id.slice(0, 8)}`;
  }

  // Une position reçue il y a plus de 30s (pas de mise à jour depuis) est
  // affichée comme "en pause" plutôt que "en ligne" — le partage GPS de
  // l'app mobile envoie une position toutes les ~10s pendant une course.
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
        {/* Emplacement de la carte réelle (Google Maps / Mapbox) — à intégrer
            avec un provider de tuiles. Les coordonnées temps réel sont déjà
            disponibles ici via useDriverPositions(), prêtes à alimenter des
            marqueurs dès que la carte sera branchée. */}
        <Card className="flex h-[480px] items-center justify-center lg:col-span-2">
          <div className="text-center text-sm text-muted">
            <Navigation className="mx-auto mb-2" size={24} />
            Intégration carte (Google Maps / Mapbox) à brancher ici.
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chauffeurs en ligne ({positions.length})</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {positions.length === 0 && (
              <p className="text-sm text-muted">
                Aucune position reçue pour le moment — un chauffeur doit être connecté
                sur l'app mobile avec le partage de position activé (bascule "En ligne"
                sur l'écran Accueil).
              </p>
            )}
            {positions.map((p) => (
              <div key={p.driver_id} className="flex items-center justify-between rounded-lg border border-border p-3">
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
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
