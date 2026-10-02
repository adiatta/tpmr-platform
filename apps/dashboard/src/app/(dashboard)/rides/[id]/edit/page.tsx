"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { api } from "@/lib/api";
import type { Child, Driver, Ride } from "@/lib/types";

interface FormValues {
  driver_id: string;
  scheduled_at: string;
  comment: string;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditRidePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  useEffect(() => {
    Promise.all([api.getRide(params.id), api.listChildren(), api.listDrivers()])
      .then(([rideData, childrenData, driversData]) => {
        setRide(rideData);
        setChildren(childrenData);
        setDrivers(driversData);
        setPickupAddress(rideData.pickup_address);
        setDropoffAddress(rideData.dropoff_address);
        if (rideData.pickup_latitude != null && rideData.pickup_longitude != null) {
          setPickupCoords({ lat: rideData.pickup_latitude, lng: rideData.pickup_longitude });
        }
        if (rideData.dropoff_latitude != null && rideData.dropoff_longitude != null) {
          setDropoffCoords({ lat: rideData.dropoff_latitude, lng: rideData.dropoff_longitude });
        }
        reset({
          driver_id: rideData.driver_id ?? "",
          scheduled_at: toLocalInputValue(rideData.scheduled_at),
          comment: rideData.comment ?? "",
        });
      })
      .catch((err) => setApiError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [params.id, reset]);

  function childName(id: string) {
    const child = children.find((c) => c.id === id);
    return child ? `${child.first_name} ${child.last_name}` : "—";
  }

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await api.updateRide(params.id, {
        driver_id: values.driver_id || null,
        pickup_address: pickupAddress,
        pickup_latitude: pickupCoords?.lat ?? null,
        pickup_longitude: pickupCoords?.lng ?? null,
        dropoff_address: dropoffAddress,
        dropoff_latitude: dropoffCoords?.lat ?? null,
        dropoff_longitude: dropoffCoords?.lng ?? null,
        scheduled_at: new Date(values.scheduled_at).toISOString(),
        comment: values.comment || null,
      });
      router.push("/rides");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  if (loading) return <p className="text-sm text-muted">Chargement...</p>;
  if (!ride) return <p className="text-sm text-danger">Course introuvable.</p>;

  return (
    <Card className="max-w-xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Modifier la course</h2>
        <RideStatusBadge status={ride.status} />
      </div>

      <p className="mb-4 text-sm text-muted">
        Enfant : <span className="font-medium text-foreground">{childName(ride.child_id)}</span>{" "}
        <span className="text-xs">(non modifiable — supprimez et recréez la course pour changer l'enfant)</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Chauffeur</span>
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
              if (coords) setPickupCoords(coords);
            }}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse d'arrivée</span>
          <AddressAutocomplete
            value={dropoffAddress}
            onChange={(address, coords) => {
              setDropoffAddress(address);
              if (coords) setDropoffCoords(coords);
            }}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Heure prévue</span>
          <Input type="datetime-local" {...register("scheduled_at")} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Commentaire</span>
          <Input {...register("comment")} placeholder="Instructions particulières..." />
        </label>

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
