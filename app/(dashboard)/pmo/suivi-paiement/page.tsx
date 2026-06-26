"use client";

import { useState } from "react";
import { FileDown, Upload, Wallet, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatMontant, isBcSolde } from "@/lib/utils";

export default function SuiviPaiementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.bcSummary(), [refreshKey]);

  async function handleExport() {
    try {
      await api.exportBcSuivi();
      toast.success("Export Excel téléchargé.");
    } catch {
      toast.error("Erreur lors de l'export.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.importBcSuivi(file);
      toast.success(`${result.sitesImported} site(s), ${result.lignesImported} ligne(s) importé(s).`);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Erreur lors de l'import.");
    }
    e.target.value = "";
  }

  if (loading) return <Loader label="Chargement du suivi paiement…" />;

  const summary = data;
  const bons = summary?.bons ?? [];
  const totaux = summary?.totaux;

  return (
    <>
      <PageHeader
        title="Suivi paiement OCM"
        subtitle="Synthèse PO, facturé HT et montants restants."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:bg-canvas">
              <Upload className="size-4" /> Import Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <Button variant="outline" onClick={handleExport}><FileDown /> Export Excel</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total PO" value={formatMontant(totaux?.totalPo ?? 0)} icon={<Wallet />} tone="var(--color-brand-500)" />
        <StatCard label="Facturé HT" value={formatMontant(totaux?.totalFacture ?? 0)} icon={<Receipt />} tone="var(--color-ok)" />
        <StatCard label="Non facturé" value={formatMontant(totaux?.totalRestant ?? 0)} icon={<Wallet />} tone="var(--color-warn)" />
        <StatCard label="Bons de commande" value={totaux?.nbBons ?? 0} icon={<Receipt />} tone="var(--color-rest)" />
      </div>

      <Card>
        <CardHeader title="Détail par bon de commande" icon={<Receipt />} />
        <div className="border-t border-line">
          <Table>
            <THead>
              <TH>N° BC</TH>
              <TH>Projet</TH>
              <TH className="text-right">Montant PO</TH>
              <TH className="text-right">Facturé HT</TH>
              <TH className="text-right">Restant</TH>
              <TH>Sites liés</TH>
              <TH>État</TH>
            </THead>
            <TBody>
              {bons.map((b) => {
                const solde = isBcSolde(b.montantRestant);
                return (
                  <TR key={b.id}>
                    <TD className="font-mono font-medium">{b.numeroBc}</TD>
                    <TD className="text-muted">{b.projetAssocie ?? "—"}</TD>
                    <TD className="text-right tabular">{formatMontant(b.montantPo)}</TD>
                    <TD className="text-right tabular">{formatMontant(b.montantFacture)}</TD>
                    <TD className="text-right tabular font-medium">{formatMontant(b.montantRestant)}</TD>
                    <TD>{b.chantiers?.length ?? 0}</TD>
                    <TD>
                      <Badge tone={solde ? "ok" : "warn"} dot>
                        {solde ? "Soldé" : "En cours"}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
