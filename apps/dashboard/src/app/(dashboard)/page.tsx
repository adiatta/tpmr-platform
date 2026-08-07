"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RidesPerHourChart } from "@/components/dashboard/rides-chart";
import { Users, Baby, Car, CheckCircle2, Clock, Radio } from "lucide-react";
import { api } from "@/lib/api";
import type { Child, Driver, Ride } from "@/lib/types";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function DashboardPage() {
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
        setRides(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const todayRides = rides.filter((r) => isToday(r.scheduled_at));
  const completed = todayRides.filter((r) => r.status === "terminee").length;
  const remaining = todayRides.filter((r) => r.status !== "terminee" && r.status !== "annulee").length;
  const online = drivers.filter((d) => d.is_online).length;

  const incidentsOrCancelled = rides
    .filter((r) => r.status === "incident" || r.status === "annulee")
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5);

  function childName(id: string) {
    const child = children.find((c) => c.id === id);
    return child ? `${child.first_name} ${child.last_name}` : "—";
  }

  const kpis = [
    { label: "Chauffeurs", value: String(drivers.length), icon: Users, tone: "primary" as const },
    { label: "Enfants suivis", value: String(children.length), icon: Baby, tone: "primary" as const },
    { label: "Courses aujourd'hui", value: String(todayRides.length), icon: Car, tone: "primary" as const },
    { label: "Terminées", value: String(completed), icon: CheckCircle2, tone: "success" as const },
    { label: "Restantes", value: String(remaining), icon: Clock, tone: "amber" as const },
    { label: "Chauffeurs connectés", value: `${online} / ${drivers.length}`, icon: Radio, tone: "success" as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Courses par heure — aujourd'hui</CardTitle>
          </CardHeader>
          <RidesPerHourChart rides={todayRides} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes récentes</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            {incidentsOrCancelled.length === 0 && !loading && (
              <p className="text-sm text-muted">Aucune alerte récente.</p>
            )}
            {incidentsOrCancelled.map((ride) => (
              <div key={ride.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{childName(ride.child_id)}</p>
                  <p className="text-sm text-muted">{ride.comment ?? "—"}</p>
                </div>
                <RideStatusBadge status={ride.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
