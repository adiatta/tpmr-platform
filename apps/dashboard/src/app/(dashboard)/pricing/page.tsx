"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PricingRule {
  id: string;
  name: string;
  baseFee: number;
  perKm: number;
  longDistanceThreshold: number;
  longDistanceSurcharge: number;
  scope: string;
}

// Données de démonstration — à remplacer par GET /api/v1/pricing
// (le modèle Pricing et pricing_service.py existent déjà côté backend)
const RULES: PricingRule[] = [
  { id: "1", name: "Tarif global", baseFee: 8, perKm: 1.2, longDistanceThreshold: 30, longDistanceSurcharge: 15, scope: "Tous" },
  { id: "2", name: "IME Les Tournesols", baseFee: 7, perKm: 1.1, longDistanceThreshold: 25, longDistanceSurcharge: 10, scope: "Établissement" },
];

export default function PricingPage() {
  const [rules] = useState(RULES);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Le tarif le plus spécifique s'applique automatiquement (enfant &gt; établissement &gt; global)
        </p>
        <Button>
          <Plus size={16} />
          Nouveau tarif
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base font-semibold">{rule.name}</p>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                {rule.scope}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Prix fixe</p>
                <p className="font-medium tabular-nums">{rule.baseFee} €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Prix / km</p>
                <p className="font-medium tabular-nums">{rule.perKm} €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Seuil longue distance</p>
                <p className="font-medium tabular-nums">{rule.longDistanceThreshold} km</p>
              </div>
              <div>
                <p className="text-xs text-muted">Majoration longue distance</p>
                <p className="font-medium tabular-nums">+{rule.longDistanceSurcharge}%</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Simulateur rapide</p>
        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="mb-1.5 block text-sm font-medium">Distance (km)</span>
            <Input type="number" defaultValue={12} />
          </label>
          <Button variant="secondary">Calculer</Button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Estimation avec le tarif global : <span className="font-medium text-foreground">22,40 €</span>
        </p>
      </Card>
    </div>
  );
}
