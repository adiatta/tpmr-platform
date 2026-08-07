"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await api.login(email, password);
      window.sessionStorage.setItem("tpmr_access_token", access_token);
      router.push("/");
    } catch (err) {
      // "Load failed" / "Failed to fetch" = le navigateur n'a même pas réussi
      // à joindre le serveur (mauvais port, backend arrêté, ou CORS bloqué
      // avant que la requête ne parte). On distingue ce cas des erreurs
      // métier (401, etc.) qui, elles, viennent bien du backend.
      if (err instanceof TypeError) {
        setError(
          `Impossible de joindre l'API sur ${API_BASE_URL}. Vérifiez que le ` +
            `backend tourne bien sur ce port et que l'origine de ce dashboard ` +
            `(${typeof window !== "undefined" ? window.location.origin : ""}) ` +
            `figure dans CORS_ORIGINS côté backend.`,
        );
      } else {
        setError(err instanceof Error ? err.message : "Erreur de connexion");
      }
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
            <h1 className="font-display text-xl font-bold">TPMR</h1>
            <p className="text-sm text-muted">Transport de personnes à mobilité réduite</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-border bg-surface p-6 shadow-card"
        >
          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tpmr.fr"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
