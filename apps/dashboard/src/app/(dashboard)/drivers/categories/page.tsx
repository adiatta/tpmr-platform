"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  description: string;
}

// Données de démonstration — à remplacer par GET /api/v1/drivers/categories
const INITIAL: Category[] = [
  { id: "1", name: "Standard", description: "Véhicule léger, sans équipement spécifique" },
  { id: "2", name: "PMR", description: "Véhicule aménagé fauteuil roulant" },
];

export default function DriverCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function addCategory() {
    if (!name.trim()) return;
    setCategories((prev) => [...prev, { id: crypto.randomUUID(), name, description }]);
    setName("");
    setDescription("");
  }

  function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="max-w-xl">
        <h2 className="mb-4 font-display text-base font-semibold">Nouvelle catégorie</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Nom (ex. PMR)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={addCategory}>
            <Plus size={16} />
            Ajouter
          </Button>
        </div>
      </Card>

      <Card className="max-w-xl p-0 overflow-hidden">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between border-b border-border p-4 last:border-0"
          >
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
      </Card>
    </div>
  );
}
