"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RideStatusBadge } from "@/components/ui/ride-status-badge";
import { RideStatusTimeline } from "@/components/ui/ride-status-timeline";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { api } from "@/lib/api";
import { useLiveNotifications } from "@/hooks/use-live-notifications";
import { groupRides, type DateGroup } from "@/lib/group-rides";
import type { Child, Driver, Ride } from "@/lib/types";

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    return Promise.all([api.listRides(), api.listChildren(), api.listDrivers()])
      .then(([ridesData, childrenData, driversData]) => {
        setRides(ridesData);
        setChildren(childrenData);
        setDrivers(driversData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"));
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  const { notifications } = useLiveNotifications();
  useEffect(() => {
    if (notifications.length > 0) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  // Regroupe une seule fois par changement de liste — recalculer "now" à
  // chaque rendu suffit ici (pas besoin d'un setInterval : la liste se
  // rafraîchit déjà via les notifications temps réel et au chargement).
  const { today, history, upcoming } = useMemo(() => groupRides(rides, new Date()), [rides]);

  function childName(id: string) {
    const child = children.find((c) => c.id === id);
    return child ? `${child.first_name} ${child.last_name}` : "—";
  }

  function driverName(id: string | null) {
    if (!id) return "—";
    return drivers.find((d) => d.id === id)?.full_name ?? "—";
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteRide(id);
      setRides((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{loading ? "Chargement..." : `${rides.length} courses`}</p>
        <Link href="/rides/new">
          <Button>
            <Plus size={16} />
            Nouvelle course
          </Button>
        </Link>
      </div>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && rides.length === 0 && (
        <Card>
          <p className="text-sm text-muted">Aucune course pour le moment.</p>
        </Card>
      )}

      {today.length > 0 && (
        <RideSection title="Aujourd'hui" rides={today} childName={childName} driverName={driverName} onDelete={handleDelete} />
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Prochaines courses</h2>
          {upcoming.map((group) => (
            <DateGroupBlock
              key={group.dateKey}
              group={group}
              childName={childName}
              driverName={driverName}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Historique</h2>
          {history.map((group) => (
            <DateGroupBlock
              key={group.dateKey}
              group={group}
              childName={childName}
              driverName={driverName}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SharedProps {
  childName: (id: string) => string;
  driverName: (id: string | null) => string;
  onDelete: (id: string) => void;
}

function RideSection({ title, rides, ...shared }: { title: string; rides: Ride[] } & SharedProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <RidesTable rides={rides} {...shared} />
    </div>
  );
}

function DateGroupBlock({ group, ...shared }: { group: DateGroup<Ride> } & SharedProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium capitalize text-muted">{group.dateLabel}</p>
      <RidesTable rides={group.rides} {...shared} />
    </div>
  );
}

function RidesTable({ rides, childName, driverName, onDelete }: { rides: Ride[] } & SharedProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Heure</th>
            <th className="px-4 py-3 font-medium">Enfant</th>
            <th className="px-4 py-3 font-medium">Chauffeur</th>
            <th className="px-4 py-3 font-medium">Progression</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride.id} className="border-b border-border last:border-0 hover:bg-background/40">
              <td className="px-4 py-3">
                <Link
                  href={`/rides/${ride.id}/edit`}
                  className="focus-ring block font-mono text-xs text-muted hover:text-primary"
                >
                  {new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/rides/${ride.id}/edit`} className="focus-ring font-medium text-foreground hover:text-primary">
                  {childName(ride.child_id)}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{driverName(ride.driver_id)}</td>
              <td className="px-4 py-3">
                <RideStatusTimeline status={ride.status} />
              </td>
              <td className="px-4 py-3">
                <RideStatusBadge status={ride.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <ConfirmDeleteButton label="Supprimer cette course" onConfirm={() => onDelete(ride.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
