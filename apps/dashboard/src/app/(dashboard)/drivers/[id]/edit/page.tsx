"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const schema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  phone: z.string().min(6, "Téléphone requis"),
  vehicle_plate: z.string().optional(),
  vehicle_model: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

// Données de démonstration — à remplacer par GET /api/v1/drivers/{id}
const DEMO_DRIVER: FormValues = {
  full_name: "Karim Benali",
  phone: "06 12 34 56 78",
  vehicle_plate: "AB-123-CD",
  vehicle_model: "Renault Kangoo",
  is_active: true,
};

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEMO_DRIVER });

  async function onSubmit(values: FormValues) {
    // PATCH /api/v1/drivers/{id} — endpoint déjà livré côté backend
    console.log("Mise à jour chauffeur", params.id, values);
    router.push("/drivers");
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

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} className="h-4 w-4 rounded border-border" />
          <span className="text-sm font-medium">Compte actif</span>
        </label>

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
