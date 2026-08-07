"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

const schema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  phone: z.string().min(6, "Téléphone requis"),
  vehicle_plate: z.string().optional(),
  vehicle_model: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api
      .getDriver(params.id)
      .then((driver) =>
        reset({
          full_name: driver.full_name,
          phone: driver.phone,
          vehicle_plate: driver.vehicle_plate ?? "",
          vehicle_model: driver.vehicle_model ?? "",
        }),
      )
      .catch((err) => setApiError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [params.id, reset]);

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await api.updateDriver(params.id, values);
      router.push("/drivers");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Chargement...</p>;
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Modifier le chauffeur</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nom complet</span>
          <Input {...register("full_name")} />
          {errors.full_name && <span className="mt-1 block text-xs text-danger">{errors.full_name.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Téléphone</span>
          <Input {...register("phone")} />
          {errors.phone && <span className="mt-1 block text-xs text-danger">{errors.phone.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Immatriculation</span>
            <Input {...register("vehicle_plate")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Modèle du véhicule</span>
            <Input {...register("vehicle_model")} />
          </label>
        </div>

        {apiError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{apiError}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
