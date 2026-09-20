"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, API_BASE_URL, type InvoiceOut, type InvoiceStatus } from "@/lib/api";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
};

const STATUS_TONE: Record<InvoiceStatus, string> = {
  brouillon: "bg-border/60 text-muted",
  emise: "bg-amber-soft text-amber-900",
  payee: "bg-success-soft text-success",
};

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .listInvoices()
      .then(setInvoices)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const { start, end } = currentMonthRange();
      const created = await api.generateInvoices(start, end);
      setInvoices((prev) => [...created, ...prev]);
      if (created.length === 0) {
        setError("Aucune nouvelle course facturable ce mois-ci (déjà facturées ou aucune course terminée).");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(invoice: InvoiceOut) {
    setDownloadingId(invoice.id);
    try {
      const token = window.sessionStorage.getItem("tpmr_access_token");
      const res = await fetch(api.invoicePdfUrl(invoice.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Impossible de télécharger le PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoice.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de téléchargement");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleMarkIssued(invoice: InvoiceOut) {
    try {
      const updated = await api.updateInvoiceStatus(invoice.id, "emise");
      setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{loading ? "Chargement..." : `${invoices.length} factures`}</p>
        <Button onClick={handleGenerate} disabled={generating}>
          <FileText size={16} />
          {generating ? "Génération..." : "Générer les factures du mois"}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Facture</th>
              <th className="px-4 py-3 font-medium">Destinataire</th>
              <th className="px-4 py-3 font-medium">Période</th>
              <th className="px-4 py-3 font-medium">Courses</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3 font-mono text-xs text-muted">{invoice.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 font-medium">{invoice.institution_name ?? "Responsable direct"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(invoice.period_start).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-muted">{invoice.rides_count}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{invoice.total_amount.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => invoice.status === "brouillon" && handleMarkIssued(invoice)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[invoice.status]} ${invoice.status === "brouillon" ? "cursor-pointer" : "cursor-default"}`}
                    title={invoice.status === "brouillon" ? "Cliquer pour marquer comme émise" : undefined}
                  >
                    {STATUS_LABEL[invoice.status]}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDownload(invoice)}
                    disabled={downloadingId === invoice.id}
                    className="focus-ring rounded-lg p-1.5 text-muted hover:bg-border/40 hover:text-primary disabled:opacity-50"
                    aria-label="Télécharger le PDF"
                  >
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && invoices.length === 0 && (
          <p className="p-4 text-sm text-muted">Aucune facture pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
