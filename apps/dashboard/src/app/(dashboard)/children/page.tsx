"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type Institution } from "@/lib/api";
import type { Child } from "@/lib/types";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listChildren(), api.listInstitutions()])
      .then(([childrenData, institutionsData]) => {
        setChildren(childrenData);
        setInstitutions(institutionsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  function institutionName(id: string | null) {
    if (!id) return "—";
    return institutions.find((i) => i.id === id)?.name ?? "—";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Chargement..." : `${children.length} enfants suivis`}
        </p>
        <Link href="/children/new">
          <Button>
            <Plus size={16} />
            Ajouter un enfant
          </Button>
        </Link>
      </div>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

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
            {children.map((child) => (
              <tr key={child.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3">
                  <Link href={`/children/${child.id}/edit`} className="focus-ring font-medium text-foreground hover:text-primary">
                    {child.first_name} {child.last_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{institutionName(child.institution_id)}</td>
                <td className="px-4 py-3 text-muted">{child.guardian_name}</td>
                <td className="px-4 py-3 text-muted">{child.special_needs ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && children.length === 0 && (
          <p className="p-4 text-sm text-muted">Aucun enfant pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
