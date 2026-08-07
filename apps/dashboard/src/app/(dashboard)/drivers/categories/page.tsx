"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type DriverCategory } from "@/lib/api";

export default function DriverCategoriesPage() {
  const [categories, setCategories] = useState<DriverCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listDriverCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  async function addCategory() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.createDriverCategory({ name, description: description || undefined });
      setCategories((prev) => [...prev, created]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCategory(id: string) {
    try {
      await api.deleteDriverCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="max-w-xl">
        <h2 className="mb-4 font-display text-base font-semibold">Nouvelle catégorie</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Nom (ex. PMR)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={addCategory} disabled={submitting}>
            <Plus size={16} />
            Ajouter
          </Button>
        </div>
      </Card>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Card className="max-w-xl p-0 overflow-hidden">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <div>
              <p className="text-sm font-medium">{category.name}</p>
              <p className="text-sm text-muted">{category.description}</p>
            </div>
            <button
              onClick={() => removeCategory(category.id)}
              className="focus-ring rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
              aria-label={`Supprimer ${category.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {!loading && categories.length === 0 && (
          <p className="p-4 text-sm text-muted">Aucune catégorie pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
