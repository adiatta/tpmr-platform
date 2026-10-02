"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { api } from "@/lib/api";
import type { Child, Driver } from "@/lib/types";

interface FormValues {
  child_id: string;
  driver_id: string;
  scheduled_at: string;
  comment: string;
}

export default function NewRidePage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

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
    setAddressError(null);
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      setAddressError("Adresse de départ et d'arrivée requises.");
      return;
    }
    try {
      await api.createRide({
        child_id: values.child_id,
        driver_id: values.driver_id || null,
        pickup_address: pickupAddress,
        pickup_latitude: pickupCoords?.lat ?? null,
        pickup_longitude: pickupCoords?.lng ?? null,
        dropoff_address: dropoffAddress,
        dropoff_latitude: dropoffCoords?.lat ?? null,
        dropoff_longitude: dropoffCoords?.lng ?? null,
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
            {...register("child_id", { required: true })}
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="">— Sélectionner —</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
          {errors.child_id && <span className="mt-1 block text-xs text-danger">Enfant requis</span>}
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

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse de départ</span>
          <AddressAutocomplete
            value={pickupAddress}
            onChange={(address, coords) => {
  setPickupAddress(address);
  setPickupCoords(coords ?? null);
}}
            placeholder="12 rue des Lilas, 75020 Paris"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse d'arrivée</span>
          <AddressAutocomplete
            value={dropoffAddress}
            onChange={(address, coords) => {
  setDropoffAddress(address);
  setDropoffCoords(coords ?? null);
}}
            placeholder="IME Les Tournesols"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Heure prévue</span>
          <Input type="datetime-local" {...register("scheduled_at", { required: true })} />
          {errors.scheduled_at && <span className="mt-1 block text-xs text-danger">Heure requise</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Commentaire</span>
          <Input {...register("comment")} placeholder="Instructions particulières..." />
        </label>

        {addressError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{addressError}</p>}
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
