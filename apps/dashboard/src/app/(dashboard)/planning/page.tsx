"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { api } from "@/lib/api";
import type { Child, Driver, Ride } from "@/lib/types";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function PlanningPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listDrivers(), api.listChildren(), api.listRides()])
      .then(([d, c, r]) => {
        setDrivers(d);
        setChildren(c);
        setRides(r.filter((ride) => isToday(ride.scheduled_at)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  function childName(id: string) {
    const child = children.find((c) => c.id === id);
    return child ? `${child.first_name} ${child.last_name}` : "—";
  }

  if (loading) return <p className="text-sm text-muted">Chargement...</p>;
  if (error) return <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Planning du jour — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {drivers.map((driver) => {
          const driverRides = rides
            .filter((r) => r.driver_id === driver.id)
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
          return (
            <Card key={driver.id}>
              <p className="mb-3 font-display text-sm font-semibold">{driver.full_name}</p>
              <div className="flex flex-col gap-2">
                {driverRides.map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <div>
                      <p className="font-mono text-xs text-muted">
                        {new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-sm font-medium">{childName(ride.child_id)}</p>
                    </div>
                    <RideStatusBadge status={ride.status} />
                  </div>
                ))}
                {driverRides.length === 0 && <p className="text-sm text-muted">Aucune course assignée</p>}
              </div>
            </Card>
          );
        })}
        {drivers.length === 0 && <p className="text-sm text-muted">Aucun chauffeur pour le moment.</p>}
      </div>
    </div>
  );
}
