"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // POST /api/v1/rides — endpoint déjà livré côté backend
    console.log("Création course", values);
    router.push("/rides");
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Nouvelle course</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Enfant" error={errors.child_id?.message}>
          <Input {...register("child_id")} placeholder="Léo Martin" />
        </Field>

        <Field label="Chauffeur (optionnel à la création)">
          <Input {...register("driver_id")} placeholder="Karim Benali" />
        </Field>

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
