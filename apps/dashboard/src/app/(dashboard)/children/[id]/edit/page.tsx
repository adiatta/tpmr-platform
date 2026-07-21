"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const schema = z.object({
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  home_address: z.string().min(4, "Adresse requise"),
  guardian_name: z.string().min(2, "Nom du responsable requis"),
  guardian_phone: z.string().min(6, "Téléphone requis"),
  special_needs: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Données de démonstration — à remplacer par GET /api/v1/children/{id}
const DEMO_CHILD: FormValues = {
  first_name: "Léo",
  last_name: "Martin",
  home_address: "12 rue des Lilas, 75020 Paris",
  guardian_name: "Mme Martin",
  guardian_phone: "06 12 34 56 78",
  special_needs: "Fauteuil roulant",
};

export default function EditChildPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEMO_CHILD });

  async function onSubmit(values: FormValues) {
    // PATCH /api/v1/children/{id}
    console.log("Mise à jour enfant", params.id, values);
    router.push("/children");
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Modifier l'enfant</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Prénom</span>
            <Input {...register("first_name")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Nom</span>
            <Input {...register("last_name")} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse du domicile</span>
          <Input {...register("home_address")} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Nom du responsable</span>
            <Input {...register("guardian_name")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Téléphone du responsable</span>
            <Input {...register("guardian_phone")} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Besoins spécifiques</span>
          <Input {...register("special_needs")} />
        </label>

        {Object.keys(errors).length > 0 && (
          <p className="text-xs text-danger">Merci de vérifier les champs en rouge.</p>
        )}

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
