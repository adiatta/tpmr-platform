"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
      if (result.dev_reset_token) {
        // Uniquement présent en mode DEBUG côté backend (pas d'envoi
        // d'email configuré) — permet de tester le flux de bout en bout
        // sans service d'email. À retirer de l'affichage une fois l'envoi
        // d'email réel branché en production.
        setDevToken(result.dev_reset_token);
        setToken(result.dev_reset_token);
      }
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            T
          </div>
          <div className="text-center">
            <h1 className="font-display text-xl font-bold">Mot de passe oublié</h1>
            <p className="text-sm text-muted">
              {step === "request"
                ? "Indiquez votre email pour recevoir un lien de réinitialisation."
                : "Entrez le code reçu et votre nouveau mot de passe."}
            </p>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          {step === "request" ? (
            <form onSubmit={handleRequestReset}>
              <div className="mb-5">
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tpmr.fr"
                />
              </div>

              {error && <p className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              {message && (
                <p className="mb-4 rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">{message}</p>
              )}

              {devToken && (
                <p className="mb-4 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-900">
                  Mode développement — aucun email n'est réellement envoyé (pas de service
                  d'email configuré). Le code a été pré-rempli automatiquement.
                </p>
              )}

              <div className="mb-4">
                <label htmlFor="token" className="mb-1.5 block text-sm font-medium">
                  Code de réinitialisation
                </label>
                <Input id="token" required value={token} onChange={(e) => setToken(e.target.value)} />
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium">
                  Nouveau mot de passe
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          )}

          <Link href="/login" className="mt-5 block text-center text-sm font-medium text-primary">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
