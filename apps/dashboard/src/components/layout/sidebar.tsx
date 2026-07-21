"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  Baby,
  Building2,
  Car,
  CalendarDays,
  Receipt,
  Tag,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/map", label: "Carte GPS", icon: Map },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/rides", label: "Courses", icon: Car },
      { href: "/planning", label: "Planning", icon: CalendarDays },
      { href: "/calendar", label: "Calendrier", icon: CalendarDays },
    ],
  },
  {
    label: "Répertoire",
    items: [
      { href: "/drivers", label: "Chauffeurs", icon: Users },
      { href: "/children", label: "Enfants", icon: Baby },
      { href: "/institutions", label: "Établissements", icon: Building2 },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/billing", label: "Facturation", icon: Receipt },
      { href: "/pricing", label: "Tarifs", icon: Tag },
      { href: "/reports", label: "Rapports", icon: BarChart3 },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/messages", label: "Messagerie", icon: MessageSquare },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          T
        </div>
        <span className="font-display text-base font-bold tracking-tight">TPMR</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-foreground/80 hover:bg-border/40",
                    )}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className="focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/80 hover:bg-border/40"
        >
          <Settings size={17} />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
