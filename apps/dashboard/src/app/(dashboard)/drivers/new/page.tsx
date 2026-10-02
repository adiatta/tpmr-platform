"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { isValidFrenchPhone } from "@/lib/phone";

const driverSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  phone: z.string().refine(isValidFrenchPhone, "Numéro invalide (ex. 06 12 34 56 78)"),
  vehicle_plate: z.string().optional(),
  vehicle_model: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function NewDriverPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({ resolver: zodResolver(driverSchema) });

  async function onSubmit(values: DriverFormValues) {
    setApiError(null);
    try {
      await api.createDriver(values);
      router.push("/drivers");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de la création du chauffeur");
    }
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Ajouter un chauffeur</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nom complet" error={errors.full_name?.message}>
          <Input {...register("full_name")} placeholder="Karim Benali" />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} placeholder="karim.benali@tpmr.fr" />
        </Field>

        <Field label="Mot de passe temporaire" error={errors.password?.message}>
          <Input type="password" {...register("password")} placeholder="••••••••" />
        </Field>
        <p className="-mt-2 text-xs text-muted">
          Le chauffeur utilisera cet email et ce mot de passe pour se connecter sur l'app mobile.
        </p>

        <Field label="Téléphone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="06 12 34 56 78" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Immatriculation">
            <Input {...register("vehicle_plate")} placeholder="AB-123-CD" />
          </Field>
          <Field label="Modèle du véhicule">
            <Input {...register("vehicle_model")} placeholder="Renault Kangoo" />
          </Field>
        </div>

        {apiError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{apiError}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le chauffeur"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
