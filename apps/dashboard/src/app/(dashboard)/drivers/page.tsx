"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Driver } from "@/lib/types";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listDrivers()
      .then(setDrivers)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Chargement..." : `${drivers.length} chauffeurs enregistrés`}
        </p>
        <Link href="/drivers/new">
          <Button>
            <Plus size={16} />
            Ajouter un chauffeur
          </Button>
        </Link>
      </div>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Chauffeur</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Véhicule</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3">
                  <Link href={`/drivers/${driver.id}/edit`} className="focus-ring font-medium text-foreground hover:text-primary">
                    {driver.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} /> {driver.phone}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {driver.vehicle_model ?? "—"} {driver.vehicle_plate ? `· ${driver.vehicle_plate}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      driver.is_online ? "text-success" : "text-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${driver.is_online ? "bg-success" : "bg-border"}`}
                    />
                    {driver.is_online ? "En ligne" : "Hors ligne"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && drivers.length === 0 && (
          <p className="p-4 text-sm text-muted">Aucun chauffeur pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
