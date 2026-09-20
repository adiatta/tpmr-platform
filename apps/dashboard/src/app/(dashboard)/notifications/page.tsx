"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api, type ConversationSummary, type MessageOut } from "@/lib/api";
import { useLiveNotifications } from "@/hooks/use-live-notifications";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const loadConversations = useCallback(() => {
    return api.listConversations().then((data) => {
      setConversations(data);
      setActiveDriverId((current) => current ?? (data.length > 0 ? data[0].driver_id : null));
    });
  }, []);

  useEffect(() => {
    loadConversations()
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [loadConversations]);

  const loadActiveConversation = useCallback(() => {
    if (!activeDriverId) return;
    api.getConversation(activeDriverId).then(setMessages).catch(() => {});
  }, [activeDriverId]);

  useEffect(() => {
    loadActiveConversation();
  }, [loadActiveConversation]);

  const { notifications } = useLiveNotifications();
  useEffect(() => {
    if (notifications.length === 0) return;
    loadActiveConversation();
    loadConversations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  async function handleSend() {
    if (!activeDriverId || !draft.trim()) return;
    setSending(true);
    try {
      const message = await api.sendMessage(activeDriverId, draft);
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(messageId: string) {
    try {
      await api.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  async function handleClearConversation() {
    if (!activeDriverId) return;
    try {
      await api.deleteConversation(activeDriverId);
      setMessages([]);
      setConfirmingClear(false);
      loadConversations().catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  const activeConversation = conversations.find((c) => c.driver_id === activeDriverId);

  if (loading) return <p className="text-sm text-muted">Chargement...</p>;

  if (conversations.length === 0) {
    return <p className="text-sm text-muted">Aucune conversation — créez d'abord des chauffeurs.</p>;
  }

  return (
    <Card className="flex h-[600px] p-0 overflow-hidden">
      <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border">
        {conversations.map((c) => (
          <button
            key={c.driver_id}
            onClick={() => {
              setActiveDriverId(c.driver_id);
              setConfirmingClear(false);
            }}
            className={`flex w-full flex-col items-start border-b border-border p-3.5 text-left ${
              activeDriverId === c.driver_id ? "bg-primary-soft" : "hover:bg-background/60"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium">{c.driver_name}</span>
              {c.last_message_at && (
                <span className="text-xs text-muted">
                  {new Date(c.last_message_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <span className="mt-0.5 truncate text-xs text-muted">{c.last_message ?? "Aucun message"}</span>
            {c.unread_count > 0 && (
              <span className="mt-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                {c.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="font-medium">{activeConversation?.driver_name}</p>
          {messages.length > 0 && (
            confirmingClear ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">Vider toute la conversation ?</span>
                <button
                  onClick={handleClearConversation}
                  className="focus-ring rounded-lg bg-danger px-2 py-1 text-xs font-medium text-white"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="focus-ring rounded-lg border border-border p-1 text-muted hover:bg-border/40"
                  aria-label="Annuler"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClear(true)}
                className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={13} />
                Vider la conversation
              </button>
            )
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && <p className="text-sm text-muted">Aucun message dans cette conversation.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`group flex items-center gap-1.5 ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}
            >
              {m.sender_role === "admin" && (
                <button
                  onClick={() => handleDeleteMessage(m.id)}
                  className="focus-ring rounded-lg p-1 text-muted opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                  aria-label="Supprimer ce message"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <div
                className={`max-w-xs rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.sender_role === "admin"
                    ? "rounded-tr-sm bg-primary text-white"
                    : "rounded-tl-sm bg-background"
                }`}
              >
                {m.content}
              </div>
              {m.sender_role === "driver" && (
                <button
                  onClick={() => handleDeleteMessage(m.id)}
                  className="focus-ring rounded-lg p-1 text-muted opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                  aria-label="Supprimer ce message"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="px-4 pb-2 text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrire un message..."
            className="focus-ring h-10 flex-1 rounded-lg border border-border px-3 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="focus-ring rounded-lg bg-primary p-2.5 text-white disabled:opacity-50"
            aria-label="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
