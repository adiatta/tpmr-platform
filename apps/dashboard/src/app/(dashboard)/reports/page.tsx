"use client";

import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Données de démonstration — à remplacer par un agrégat de GET /api/v1/rides
const RIDES_BY_DRIVER = [
  { driver: "K. Benali", terminees: 38, annulees: 2 },
  { driver: "S. Renard", terminees: 41, annulees: 1 },
  { driver: "Y. Cherif", terminees: 29, annulees: 3 },
];

const KPIS = [
  { label: "Taux de ponctualité", value: "94%" },
  { label: "Durée moyenne / course", value: "18 min" },
  { label: "Distance moyenne", value: "9,2 km" },
  { label: "Courses non effectuées (mois)", value: "6" },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Statistiques du mois en cours</p>
        <Button variant="secondary">
          <Download size={16} />
          Exporter en CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {KPIS.map((kpi) => (
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
            <BarChart data={RIDES_BY_DRIVER} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(190 15% 88%)" vertical={false} />
              <XAxis dataKey="driver" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
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
