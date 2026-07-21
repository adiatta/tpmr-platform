import { cn } from "@/lib/utils";
import { RIDE_STATUS_LABELS, type RideStatus } from "@/lib/types";

function toneFor(status: RideStatus): string {
  if (status === "terminee") return "bg-success-soft text-success";
  if (status === "annulee" || status === "incident") return "bg-danger-soft text-danger";
  if (status === "en_attente") return "bg-border/60 text-muted";
  return "bg-amber-soft text-amber-900";
}

export function RideStatusBadge({ status }: { status: RideStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneFor(status),
      )}
    >
      {RIDE_STATUS_LABELS[status]}
    </span>
  );
}
