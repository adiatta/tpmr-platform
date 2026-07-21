import { cn } from "@/lib/utils";
import { RIDE_STATUS_LABELS, RIDE_STATUS_SEQUENCE, type RideStatus } from "@/lib/types";

/** Représente la progression réelle d'une course le long de sa machine à états
 * (cf. ALLOWED_TRANSITIONS côté backend). Les statuts "Annulée" / "Incident"
 * sont des branches, pas des étapes de la timeline — ils s'affichent à part. */
export function RideStatusTimeline({ status }: { status: RideStatus }) {
  if (status === "annulee" || status === "incident") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-danger">
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
        {RIDE_STATUS_LABELS[status]}
      </div>
    );
  }

  const currentIndex = RIDE_STATUS_SEQUENCE.indexOf(status);

  return (
    <ol className="flex items-center gap-1">
      {RIDE_STATUS_SEQUENCE.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-1">
            <span
              title={RIDE_STATUS_LABELS[step]}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                isDone && "bg-success",
                isCurrent && "bg-primary ring-4 ring-primary-soft",
                !isDone && !isCurrent && "bg-border",
              )}
            />
            {index < RIDE_STATUS_SEQUENCE.length - 1 && (
              <span className={cn("h-px w-3", isDone ? "bg-success" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
