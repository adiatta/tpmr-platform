import { Card } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import type { RideStatus } from "@/lib/types";

// Données de démonstration — à remplacer par GET /api/v1/rides?date=...
const DRIVERS_PLANNING: {
  driver: string;
  rides: { time: string; child: string; status: RideStatus }[];
}[] = [
  {
    driver: "Karim Benali",
    rides: [
      { time: "08:15", child: "Léo Martin", status: "terminee" },
      { time: "16:00", child: "Nathan Roy", status: "incident" },
    ],
  },
  {
    driver: "Sophie Renard",
    rides: [{ time: "08:30", child: "Nina Dubois", status: "en_route_vers_etablissement" }],
  },
  {
    driver: "Yanis Cherif",
    rides: [{ time: "09:00", child: "Adam Lefèvre", status: "assignee" }],
  },
];

export default function PlanningPage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">Planning du jour — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {DRIVERS_PLANNING.map((row) => (
          <Card key={row.driver}>
            <p className="mb-3 font-display text-sm font-semibold">{row.driver}</p>
            <div className="flex flex-col gap-2">
              {row.rides.map((ride, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <div>
                    <p className="font-mono text-xs text-muted">{ride.time}</p>
                    <p className="text-sm font-medium">{ride.child}</p>
                  </div>
                  <RideStatusBadge status={ride.status} />
                </div>
              ))}
              {row.rides.length === 0 && <p className="text-sm text-muted">Aucune course assignée</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
