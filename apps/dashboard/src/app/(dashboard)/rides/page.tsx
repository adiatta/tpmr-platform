import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { RideStatusTimeline } from "@/components/ui/ride-status-timeline";
import type { RideStatus } from "@/lib/types";

// Données de démonstration — à remplacer par GET /api/v1/rides.
const RIDES: {
  id: string;
  child: string;
  driver: string;
  time: string;
  status: RideStatus;
}[] = [
  { id: "1", child: "Léo Martin", driver: "Karim Benali", time: "08:15", status: "terminee" },
  { id: "2", child: "Nina Dubois", driver: "Sophie Renard", time: "08:30", status: "en_route_vers_etablissement" },
  { id: "3", child: "Adam Lefèvre", driver: "Yanis Cherif", time: "09:00", status: "assignee" },
  { id: "4", child: "Chloé Petit", driver: "—", time: "09:15", status: "en_attente" },
  { id: "5", child: "Nathan Roy", driver: "Karim Benali", time: "16:00", status: "incident" },
];

export default function RidesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{RIDES.length} courses aujourd'hui</p>
        <Link href="/rides/new">
          <Button>
            <Plus size={16} />
            Nouvelle course
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Heure</th>
              <th className="px-4 py-3 font-medium">Enfant</th>
              <th className="px-4 py-3 font-medium">Chauffeur</th>
              <th className="px-4 py-3 font-medium">Progression</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {RIDES.map((ride) => (
              <tr key={ride.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3 font-mono text-xs text-muted">{ride.time}</td>
                <td className="px-4 py-3 font-medium">{ride.child}</td>
                <td className="px-4 py-3 text-muted">{ride.driver}</td>
                <td className="px-4 py-3">
                  <RideStatusTimeline status={ride.status} />
                </td>
                <td className="px-4 py-3">
                  <RideStatusBadge status={ride.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
