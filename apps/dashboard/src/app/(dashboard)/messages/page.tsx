"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Conversation {
  id: string;
  driver: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

// Données de démonstration — le modèle Message et les endpoints /api/v1/messages
// restent à créer côté backend (l'infrastructure WebSocket existe déjà, cf.
// app/core/websocket_manager.py, module temps réel livré).
const CONVERSATIONS: Conversation[] = [
  { id: "1", driver: "Karim Benali", lastMessage: "Retard de 5 min pour la prochaine course", time: "09:12", unread: true },
  { id: "2", driver: "Sophie Renard", lastMessage: "Enfant récupéré, en route", time: "08:41", unread: false },
  { id: "3", driver: "Yanis Cherif", lastMessage: "Ok merci", time: "hier", unread: false },
];

export default function MessagesPage() {
  const [active, setActive] = useState(CONVERSATIONS[0].id);
  const [draft, setDraft] = useState("");
  const conversation = CONVERSATIONS.find((c) => c.id === active)!;

  return (
    <Card className="flex h-[600px] p-0 overflow-hidden">
      <div className="w-72 flex-shrink-0 border-r border-border">
        {CONVERSATIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`flex w-full flex-col items-start border-b border-border p-3.5 text-left ${
              active === c.id ? "bg-primary-soft" : "hover:bg-background/60"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium">{c.driver}</span>
              <span className="text-xs text-muted">{c.time}</span>
            </div>
            <span className="mt-0.5 truncate text-xs text-muted">{c.lastMessage}</span>
            {c.unread && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-border p-4">
          <p className="font-medium">{conversation.driver}</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="max-w-xs rounded-2xl rounded-tl-sm bg-background px-3.5 py-2.5 text-sm">
            {conversation.lastMessage}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire un message..."
            className="focus-ring h-10 flex-1 rounded-lg border border-border px-3 text-sm"
          />
          <button className="focus-ring rounded-lg bg-primary p-2.5 text-white" aria-label="Envoyer">
            <Send size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
