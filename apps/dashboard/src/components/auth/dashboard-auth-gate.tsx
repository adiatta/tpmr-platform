"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Enveloppe le groupe (dashboard) : vérifie au montage qu'un token existe
 * en sessionStorage, redirige vers /login sinon. N'affiche le contenu du
 * dashboard qu'une fois la vérification faite, pour éviter un flash du
 * contenu protégé avant la redirection. */
export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = window.sessionStorage.getItem("tpmr_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Chargement...</p>
      </div>
    );
  }

  return <>{children}</>;
}
