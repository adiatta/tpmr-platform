"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Driver, Ride } from "@/lib/types";

export default function ReportsPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listDrivers(), api.listRides()])
      .then(([d, r]) => {
        setDrivers(d);
        setRides(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const completedRides = rides.filter((r) => r.status === "terminee");
  const cancelledCount = rides.filter((r) => r.status === "annulee").length;
  const avgDuration = completedRides.length
    ? Math.round(completedRides.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / completedRides.length)
    : 0;
  const avgDistance = completedRides.length
    ? (completedRides.reduce((sum, r) => sum + (r.distance_km ?? 0), 0) / completedRides.length).toFixed(1)
    : "0";

  const byDriver = drivers.map((driver) => ({
    driver: driver.full_name.split(" ").map((p, i) => (i === 0 ? p[0] + "." : p)).join(" "),
    terminees: rides.filter((r) => r.driver_id === driver.id && r.status === "terminee").length,
    annulees: rides.filter((r) => r.driver_id === driver.id && r.status === "annulee").length,
  }));

  const kpis = [
    { label: "Courses terminées", value: String(completedRides.length) },
    { label: "Durée moyenne / course", value: `${avgDuration} min` },
    { label: "Distance moyenne", value: `${avgDistance} km` },
    { label: "Courses annulées", value: String(cancelledCount) },
  ];

  if (loading) return <p className="text-sm text-muted">Chargement...</p>;
  if (error) return <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">Statistiques calculées sur l'ensemble des courses enregistrées</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="font-display text-2xl font-bold tabular-nums">{kpi.value}</p>
            <p className="text-sm text-muted">{kpi.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses par chauffeur</CardTitle>
        </CardHeader>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDriver} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(190 15% 88%)" vertical={false} />
              <XAxis dataKey="driver" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(190 15% 88%)", fontSize: 13 }} />
              <Bar dataKey="terminees" name="Terminées" fill="hsl(152 50% 34%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="annulees" name="Annulées" fill="hsl(6 62% 61%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
