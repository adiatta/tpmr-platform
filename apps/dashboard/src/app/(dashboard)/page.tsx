import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RidesPerHourChart } from "@/components/dashboard/rides-chart";
import { Users, Baby, Car, CheckCircle2, Clock, Radio } from "lucide-react";

// Données de démonstration — à remplacer par des appels à l'API (react-query)
// une fois le backend branché : GET /drivers, GET /children, GET /rides.
const KPIS = [
  { label: "Chauffeurs", value: "8", icon: Users, tone: "primary" as const },
  { label: "Enfants suivis", value: "20", icon: Baby, tone: "primary" as const },
  { label: "Courses aujourd'hui", value: "60", icon: Car, tone: "primary" as const },
  { label: "Terminées", value: "37", icon: CheckCircle2, tone: "success" as const },
  { label: "Restantes", value: "23", icon: Clock, tone: "amber" as const },
  { label: "Chauffeurs connectés", value: "6 / 8", icon: Radio, tone: "success" as const },
];

const RECENT_ALERTS = [
  { id: "1", child: "L. Martin", status: "incident" as const, note: "Retard signalé — trafic dense" },
  { id: "2", child: "N. Dubois", status: "annulee" as const, note: "Annulée par l'établissement" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Courses par heure — aujourd'hui</CardTitle>
          </CardHeader>
          <RidesPerHourChart />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes récentes</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            {RECENT_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{alert.child}</p>
                  <p className="text-sm text-muted">{alert.note}</p>
                </div>
                <RideStatusBadge status={alert.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
