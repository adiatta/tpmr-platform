export interface RideLike {
  id: string;
  scheduled_at: string; // ISO
  status: string;
}

export interface DateGroup<T> {
  dateKey: string;
  dateLabel: string;
  rides: T[];
}

const FINISHED_STATUSES = new Set(["terminee", "annulee"]);

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateLabel(d: Date, now: Date): string {
  const base = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
  const capitalized = base.charAt(0).toUpperCase() + base.slice(1);
  return d.getFullYear() === now.getFullYear() ? capitalized : `${capitalized} ${d.getFullYear()}`;
}

function byTimeAsc<T extends RideLike>(a: T, b: T) {
  return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
}

export function groupRides<T extends RideLike>(
  rides: T[],
  now: Date = new Date(),
): { today: T[]; history: DateGroup<T>[]; upcoming: DateGroup<T>[] } {
  const todayKey = dateKey(now);

  const today: T[] = [];
  const historyMap = new Map<string, T[]>();
  const upcomingMap = new Map<string, T[]>();

  for (const ride of rides) {
    const rideDate = new Date(ride.scheduled_at);
    const key = dateKey(rideDate);
    const finished = FINISHED_STATUSES.has(ride.status);

    if (key === todayKey && !finished) {
      today.push(ride);
    } else if (key <= todayKey) {
      // Passé (ou aujourd'hui mais terminé/annulé) -> historique, qu'elle
      // soit allée à son terme ou non.
      const bucket = historyMap.get(key) ?? [];
      bucket.push(ride);
      historyMap.set(key, bucket);
    } else {
      const bucket = upcomingMap.get(key) ?? [];
      bucket.push(ride);
      upcomingMap.set(key, bucket);
    }
  }

  today.sort(byTimeAsc);

  const history: DateGroup<T>[] = Array.from(historyMap.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0)) // le plus récent en premier
    .map(([key, group]) => ({
      dateKey: key,
      dateLabel: dateLabel(new Date(group[0].scheduled_at), now),
      rides: group.sort(byTimeAsc),
    }));

  const upcoming: DateGroup<T>[] = Array.from(upcomingMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)) // le plus proche en premier
    .map(([key, group]) => ({
      dateKey: key,
      dateLabel: dateLabel(new Date(group[0].scheduled_at), now),
      rides: group.sort(byTimeAsc),
    }));

  return { today, history, upcoming };
}