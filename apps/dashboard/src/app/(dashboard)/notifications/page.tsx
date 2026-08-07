"use client";

import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLiveNotifications } from "@/hooks/use-live-notifications";

export default function NotificationsPage() {
  const { notifications, connected } = useLiveNotifications();

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-danger"}`} />
        <p className="text-sm text-muted">
          {connected ? "Connecté au flux temps réel" : "Connexion..."}
        </p>
      </div>

      {notifications.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <Bell size={22} className="text-muted" />
          <p className="text-sm text-muted">
            Aucune notification reçue depuis l'ouverture de cette page. Les nouveaux
            événements (changement de statut de course, message) apparaîtront ici en direct.
          </p>
        </Card>
      )}

      {notifications.map((n) => (
        <Card key={n.id} className="flex items-start gap-3">
          <Bell size={16} className="mt-0.5 text-primary" />
          <div>
            <p className="text-sm font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
            <p className="mt-0.5 text-xs text-muted">
              {new Date(n.receivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
