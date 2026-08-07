"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, type CurrentUser } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.me().then(setUser).catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"));
  }, []);

  function handleLogout() {
    window.sessionStorage.removeItem("tpmr_access_token");
    router.push("/login");
  }

  if (error) return <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>;
  if (!user) return <p className="text-sm text-muted">Chargement...</p>;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Card>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {user.full_name[0]}
          </div>
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <p className="text-xs text-muted capitalize">{user.role}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button variant="danger" onClick={handleLogout}>
          <LogOut size={16} />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
