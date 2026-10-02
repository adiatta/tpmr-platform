"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { api } from "@/lib/api";

interface FormValues {
  name: string;
  phone: string;
  opening_hours: string;
}

export default function EditInstitutionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    api
      .getInstitution(params.id)
      .then((inst) => {
        setAddress(inst.address);
        if (inst.latitude != null && inst.longitude != null) {
          setCoords({ lat: inst.latitude, lng: inst.longitude });
        }
        reset({
          name: inst.name,
          phone: inst.phone ?? "",
          opening_hours: inst.opening_hours ?? "",
        });
      })
      .catch((err) => setApiError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [params.id, reset]);

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await api.updateInstitution(params.id, {
        name: values.name,
        address,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        phone: values.phone || null,
        opening_hours: values.opening_hours || null,
      });
      router.push("/institutions");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  if (loading) return <p className="text-sm text-muted">Chargement...</p>;

  return (
    <Card className="max-w-xl">
      <h2 className="mb-5 font-display text-base font-semibold">Modifier l'établissement</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Nom</span>
          <Input {...register("name")} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse</span>
          <AddressAutocomplete
            value={address}
            onChange={(addr, c) => {
              setAddress(addr);
              if (c) setCoords(c);
            }}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Téléphone</span>
            <Input {...register("phone")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Horaires</span>
            <Input {...register("opening_hours")} />
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
