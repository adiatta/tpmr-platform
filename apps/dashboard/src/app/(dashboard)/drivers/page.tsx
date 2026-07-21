import Link from "next/link";
import { Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Données de démonstration — à remplacer par un appel à GET /api/v1/drivers.
const DRIVERS = [
  { id: "1", name: "Karim Benali", phone: "06 12 34 56 78", vehicle: "Renault Kangoo · AB-123-CD", online: true },
  { id: "2", name: "Sophie Renard", phone: "06 98 76 54 32", vehicle: "Citroën Berlingo · EF-456-GH", online: true },
  { id: "3", name: "Yanis Cherif", phone: "07 11 22 33 44", vehicle: "Renault Kangoo · IJ-789-KL", online: false },
];

export default function DriversPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{DRIVERS.length} chauffeurs enregistrés</p>
        <Link href="/drivers/new">
          <Button>
            <Plus size={16} />
            Ajouter un chauffeur
          </Button>
        </Link>
      </div>

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
            {DRIVERS.map((driver) => (
              <tr key={driver.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3">
                  <Link href={`/drivers/${driver.id}/edit`} className="focus-ring font-medium text-foreground hover:text-primary">
                    {driver.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} /> {driver.phone}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{driver.vehicle}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      driver.online ? "text-success" : "text-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${driver.online ? "bg-success" : "bg-border"}`}
                    />
                    {driver.online ? "En ligne" : "Hors ligne"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
