import { AlertTriangle, CheckCircle2, Car } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  type: "incident" | "completed" | "assigned";
  text: string;
  time: string;
}

// Données de démonstration — alimentées en réel par /api/v1/ws/notifications
// (module temps réel déjà livré côté backend)
const NOTIFICATIONS: Notification[] = [
  { id: "1", type: "incident", text: "Incident signalé par Karim Benali sur la course de Nathan Roy", time: "il y a 4 min" },
  { id: "2", type: "completed", text: "Course de Léo Martin terminée par Karim Benali", time: "il y a 22 min" },
  { id: "3", type: "assigned", text: "Course de Adam Lefèvre assignée à Yanis Cherif", time: "il y a 1h" },
];

const ICONS = {
  incident: <AlertTriangle size={16} className="text-danger" />,
  completed: <CheckCircle2 size={16} className="text-success" />,
  assigned: <Car size={16} className="text-primary" />,
};

export default function NotificationsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {NOTIFICATIONS.map((n) => (
        <Card key={n.id} className="flex items-start gap-3">
          <div className="mt-0.5">{ICONS[n.type]}</div>
          <div>
            <p className="text-sm">{n.text}</p>
            <p className="mt-0.5 text-xs text-muted">{n.time}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
