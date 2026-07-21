"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const schema = z.object({
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  home_address: z.string().min(4, "Adresse requise"),
  institution_id: z.string().optional(),
  guardian_name: z.string().min(2, "Nom du responsable requis"),
  guardian_phone: z.string().min(6, "Téléphone requis"),
  special_needs: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewChildPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // POST /api/v1/children — endpoint déjà livré côté backend
    console.log("Création enfant", values);
    router.push("/children");
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Ajouter un enfant</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" error={errors.first_name?.message}>
            <Input {...register("first_name")} placeholder="Léo" />
          </Field>
          <Field label="Nom" error={errors.last_name?.message}>
            <Input {...register("last_name")} placeholder="Martin" />
          </Field>
        </div>

        <Field label="Adresse du domicile" error={errors.home_address?.message}>
          <Input {...register("home_address")} placeholder="12 rue des Lilas, 75020 Paris" />
        </Field>

        <Field label="Établissement">
          <Input {...register("institution_id")} placeholder="IME Les Tournesols" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom du responsable" error={errors.guardian_name?.message}>
            <Input {...register("guardian_name")} placeholder="Mme Martin" />
          </Field>
          <Field label="Téléphone du responsable" error={errors.guardian_phone?.message}>
            <Input {...register("guardian_phone")} placeholder="06 12 34 56 78" />
          </Field>
        </div>

        <Field label="Besoins spécifiques">
          <Input {...register("special_needs")} placeholder="Fauteuil roulant, accompagnement..." />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer l'enfant"}
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
