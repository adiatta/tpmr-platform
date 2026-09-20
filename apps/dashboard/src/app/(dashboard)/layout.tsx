import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGate>
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title="Tableau de bord" />
          <main className="flex-1 bg-background p-6">{children}</main>
        </div>
      </div>
    </DashboardAuthGate>
  );
}
