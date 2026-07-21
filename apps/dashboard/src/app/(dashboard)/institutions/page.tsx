"use client";

import { useState } from "react";
import { Plus, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Institution {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_hours: string;
}

// Données de démonstration — à remplacer par GET /api/v1/institutions
const INITIAL: Institution[] = [
  { id: "1", name: "IME Les Tournesols", address: "5 av. des Tournesols, 75015 Paris", phone: "01 45 67 89 10", opening_hours: "8h30 – 16h30" },
  { id: "2", name: "SESSAD Horizon", address: "22 rue Horizon, 75012 Paris", phone: "01 43 21 09 87", opening_hours: "9h00 – 17h00" },
];

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", opening_hours: "" });

  function addInstitution() {
    if (!form.name.trim() || !form.address.trim()) return;
    setInstitutions((prev) => [...prev, { id: crypto.randomUUID(), ...form }]);
    setForm({ name: "", address: "", phone: "", opening_hours: "" });
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{institutions.length} établissements</p>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          Ajouter un établissement
        </Button>
      </div>

      {showForm && (
        <Card className="max-w-xl">
          <div className="flex flex-col gap-3">
            <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Horaires" value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={addInstitution}>Enregistrer</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {institutions.map((inst) => (
          <Card key={inst.id}>
            <p className="mb-2 font-display text-base font-semibold">{inst.name}</p>
            <div className="flex items-start gap-2 text-sm text-muted">
              <MapPin size={14} className="mt-0.5" />
              {inst.address}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Phone size={14} />
              {inst.phone}
            </div>
            <p className="mt-2 text-xs text-muted">Horaires : {inst.opening_hours}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
