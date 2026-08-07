"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Child, Driver } from "@/lib/types";

const schema = z.object({
  child_id: z.string().min(1, "Enfant requis"),
  driver_id: z.string().optional(),
  pickup_address: z.string().min(4, "Adresse de départ requise"),
  dropoff_address: z.string().min(4, "Adresse d'arrivée requise"),
  scheduled_at: z.string().min(1, "Heure requise"),
  comment: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewRidePage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    Promise.all([api.listChildren(), api.listDrivers()])
      .then(([childrenData, driversData]) => {
        setChildren(childrenData);
        setDrivers(driversData);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await api.createRide({
        ...values,
        driver_id: values.driver_id || null,
        comment: values.comment || null,
        scheduled_at: new Date(values.scheduled_at).toISOString(),
      });
      router.push("/rides");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de la création");
    }
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Nouvelle course</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Enfant</span>
          <select
            {...register("child_id")}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="">— Sélectionner —</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
          {errors.child_id && <span className="mt-1 block text-xs text-danger">{errors.child_id.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Chauffeur (optionnel à la création)</span>
          <select
            {...register("driver_id")}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="">— Non assigné —</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
        </label>

        <Field label="Adresse de départ" error={errors.pickup_address?.message}>
          <Input {...register("pickup_address")} placeholder="12 rue des Lilas, 75020 Paris" />
        </Field>

        <Field label="Adresse d'arrivée" error={errors.dropoff_address?.message}>
          <Input {...register("dropoff_address")} placeholder="IME Les Tournesols" />
        </Field>

        <Field label="Heure prévue" error={errors.scheduled_at?.message}>
          <Input type="datetime-local" {...register("scheduled_at")} />
        </Field>

        <Field label="Commentaire">
          <Input {...register("comment")} placeholder="Instructions particulières..." />
        </Field>

        {apiError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{apiError}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer la course"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
