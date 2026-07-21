"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [notifyIncidents, setNotifyIncidents] = useState(true);
  const [notifyDelays, setNotifyDelays] = useState(true);

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Card>
        <h2 className="mb-4 font-display text-base font-semibold">Organisation</h2>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium">Nom de l'entreprise</span>
          <Input defaultValue="TPMR Transport" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Fuseau horaire</span>
          <Input defaultValue="Europe/Paris" />
        </label>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold">Notifications</h2>
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Alertes d'incident"
            checked={notifyIncidents}
            onChange={setNotifyIncidents}
          />
          <ToggleRow label="Alertes de retard" checked={notifyDelays} onChange={setNotifyDelays} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border"
      />
    </label>
  );
}
