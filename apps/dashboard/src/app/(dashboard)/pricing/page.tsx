"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type PricingRule } from "@/lib/api";

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [distance, setDistance] = useState(12);
  const [simResult, setSimResult] = useState<{ price: number; pricing_rule_used: string | null } | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api
      .listPricing()
      .then(setRules)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  async function runSimulation() {
    setSimulating(true);
    setError(null);
    try {
      const result = await api.simulatePricing(distance);
      setSimResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de simulation");
    } finally {
      setSimulating(false);
    }
  }

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

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base font-semibold">{rule.name}</p>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                {rule.institution_id ? "Établissement" : rule.child_id ? "Enfant" : "Global"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Prix fixe</p>
                <p className="font-medium tabular-nums">{rule.base_fee} €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Prix / km</p>
                <p className="font-medium tabular-nums">{rule.price_per_km} €</p>
              </div>
              <div>
                <p className="text-xs text-muted">Seuil longue distance</p>
                <p className="font-medium tabular-nums">{rule.long_distance_threshold_km} km</p>
              </div>
              <div>
                <p className="text-xs text-muted">Majoration longue distance</p>
                <p className="font-medium tabular-nums">+{rule.long_distance_surcharge_pct}%</p>
              </div>
            </div>
          </Card>
        ))}
        {!loading && rules.length === 0 && (
          <p className="text-sm text-muted">Aucun tarif configuré — créez d'abord un tarif global.</p>
        )}
      </div>

      <Card className="max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Simulateur rapide</p>
        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="mb-1.5 block text-sm font-medium">Distance (km)</span>
            <Input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
          </label>
          <Button variant="secondary" onClick={runSimulation} disabled={simulating}>
            {simulating ? "Calcul..." : "Calculer"}
          </Button>
        </div>
        {simResult && (
          <p className="mt-3 text-sm text-muted">
            Estimation ({simResult.pricing_rule_used ?? "aucun tarif"}) :{" "}
            <span className="font-medium text-foreground">{simResult.price.toFixed(2)} €</span>
          </p>
        )}
      </Card>
    </div>
  );
}
