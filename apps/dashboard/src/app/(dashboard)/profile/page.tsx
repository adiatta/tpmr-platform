"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    window.sessionStorage.removeItem("tpmr_access_token");
    router.push("/login");
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            A
          </div>
          <div>
            <p className="font-medium">Admin TPMR</p>
            <p className="text-sm text-muted">admin@tpmr.fr</p>
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium">Nom complet</span>
          <Input defaultValue="Admin TPMR" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <Input defaultValue="admin@tpmr.fr" type="email" />
        </label>
      </Card>

      <div className="flex justify-between">
        <Button variant="danger" onClick={handleLogout}>
          <LogOut size={16} />
          Se déconnecter
        </Button>
        <Button>Enregistrer</Button>
      </div>
    </div>
  );
}
