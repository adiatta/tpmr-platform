import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "amber";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  amber: "bg-amber-soft text-amber-900",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon size={18} />
      </div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
