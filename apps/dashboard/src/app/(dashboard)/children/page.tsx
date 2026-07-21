import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Données de démonstration — à remplacer par GET /api/v1/children.
const CHILDREN = [
  { id: "1", name: "Léo Martin", institution: "IME Les Tournesols", guardian: "M. Martin", needs: "Fauteuil roulant" },
  { id: "2", name: "Nina Dubois", institution: "SESSAD Horizon", guardian: "Mme Dubois", needs: "Accompagnement sensoriel" },
  { id: "3", name: "Adam Lefèvre", institution: "IME Les Tournesols", guardian: "Mme Lefèvre", needs: "—" },
];

export default function ChildrenPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{CHILDREN.length} enfants suivis</p>
        <Link href="/children/new">
          <Button>
            <Plus size={16} />
            Ajouter un enfant
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Enfant</th>
              <th className="px-4 py-3 font-medium">Établissement</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Besoins spécifiques</th>
            </tr>
          </thead>
          <tbody>
            {CHILDREN.map((child) => (
              <tr key={child.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3">
                  <Link href={`/children/${child.id}/edit`} className="focus-ring font-medium text-foreground hover:text-primary">
                    {child.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{child.institution}</td>
                <td className="px-4 py-3 text-muted">{child.guardian}</td>
                <td className="px-4 py-3 text-muted">{child.needs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
