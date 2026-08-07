"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api, type Institution } from "@/lib/api";

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

export default function EditChildPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    Promise.all([api.getChild(params.id), api.listInstitutions()])
      .then(([child, institutionsData]) => {
        setInstitutions(institutionsData);
        reset({
          first_name: child.first_name,
          last_name: child.last_name,
          home_address: child.home_address,
          institution_id: child.institution_id ?? "",
          guardian_name: child.guardian_name,
          guardian_phone: child.guardian_phone,
          special_needs: child.special_needs ?? "",
        });
      })
      .catch((err) => setApiError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [params.id, reset]);

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await api.updateChild(params.id, {
        ...values,
        institution_id: values.institution_id || null,
        special_needs: values.special_needs || null,
      });
      router.push("/children");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Chargement...</p>;
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

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Établissement</span>
          <select
            {...register("institution_id")}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="">— Aucun —</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
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
