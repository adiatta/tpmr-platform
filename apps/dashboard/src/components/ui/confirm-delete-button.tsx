"use client";

import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<void> | void;
  label?: string;
}

export function ConfirmDeleteButton({ onConfirm, label = "Supprimer" }: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted">Confirmer ?</span>
        <button
          onClick={async () => {
            setDeleting(true);
            try {
              await onConfirm();
            } finally {
              setDeleting(false);
              setConfirming(false);
            }
          }}
          disabled={deleting}
          className="focus-ring rounded-lg bg-danger p-1.5 text-white disabled:opacity-50"
          aria-label="Confirmer la suppression"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="focus-ring rounded-lg border border-border p-1.5 text-muted hover:bg-border/40"
          aria-label="Annuler"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="focus-ring rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
      aria-label={label}
      title={label}
    >
      <Trash2 size={16} />
    </button>
  );
}
