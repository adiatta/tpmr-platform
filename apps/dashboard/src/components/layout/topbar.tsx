import { Bell } from "lucide-react";
import Link from "next/link";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <h1 className="font-display text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="focus-ring rounded-full p-2 text-muted hover:bg-border/40">
          <Bell size={18} />
        </Link>
        <Link href="/profile" className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-border/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            A
          </div>
          <span className="text-sm font-medium">Admin</span>
        </Link>
      </div>
    </header>
  );
}
