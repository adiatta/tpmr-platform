import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  institution: string;
  period: string;
  amount: string;
  status: "brouillon" | "emise" | "payee";
  ridesCount: number;
}

// Données de démonstration — à remplacer par GET /api/v1/billing
// (module Facturation à créer — cf. app/services/billing_service.py et
// pdf_generator.py, prévus dans la feuille de route backend)
const INVOICES: Invoice[] = [
  { id: "F-2026-06-01", institution: "IME Les Tournesols", period: "Juin 2026", amount: "1 240,00 €", status: "payee", ridesCount: 42 },
  { id: "F-2026-06-02", institution: "SESSAD Horizon", period: "Juin 2026", amount: "860,00 €", status: "emise", ridesCount: 28 },
  { id: "F-2026-07-01", institution: "IME Les Tournesols", period: "Juillet 2026", amount: "980,00 €", status: "brouillon", ridesCount: 33 },
];

const STATUS_LABEL: Record<Invoice["status"], string> = {
  brouillon: "Brouillon",
  emise: "Émise",
  payee: "Payée",
};

const STATUS_TONE: Record<Invoice["status"], string> = {
  brouillon: "bg-border/60 text-muted",
  emise: "bg-amber-soft text-amber-900",
  payee: "bg-success-soft text-success",
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{INVOICES.length} factures</p>
        <Button>
          <FileText size={16} />
          Générer les factures du mois
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Facture</th>
              <th className="px-4 py-3 font-medium">Établissement</th>
              <th className="px-4 py-3 font-medium">Période</th>
              <th className="px-4 py-3 font-medium">Courses</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-background/40">
                <td className="px-4 py-3 font-mono text-xs text-muted">{invoice.id}</td>
                <td className="px-4 py-3 font-medium">{invoice.institution}</td>
                <td className="px-4 py-3 text-muted">{invoice.period}</td>
                <td className="px-4 py-3 text-muted">{invoice.ridesCount}</td>
                <td className="px-4 py-3 font-medium tabular-nums">{invoice.amount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[invoice.status]}`}>
                    {STATUS_LABEL[invoice.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="focus-ring rounded-lg p-1.5 text-muted hover:bg-border/40 hover:text-primary" aria-label="Télécharger le PDF">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
