"use client";

import { useState, useCallback } from "react";
import { FileDown, Upload, Wallet, Receipt, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatMontant, isBcSolde } from "@/lib/utils";

const EMPTY_FORM = { numeroBc: "", projetAssocie: "", montantPo: "", montantFacture: "", montantRestant: "" };

export default function SuiviPaiementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.bcSummary(), [refreshKey]);
  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState<{ id: number } | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [busy, setBusy]         = useState(false);

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }
  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY_FORM); }
  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setOpen(true); }

  function openEdit(b: { id: number; numeroBc: string; projetAssocie?: string; montantPo: number | string; montantFacture: number | string; montantRestant: number | string }) {
    setEditItem({ id: b.id });
    setForm({
      numeroBc:       b.numeroBc,
      projetAssocie:  b.projetAssocie ?? "",
      montantPo:      String(b.montantPo),
      montantFacture: String(b.montantFacture),
      montantRestant: String(b.montantRestant),
    });
    setOpen(true);
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        numeroBc:       form.numeroBc,
        projetAssocie:  form.projetAssocie || undefined,
        montantPo:      Number(form.montantPo),
        montantFacture: Number(form.montantFacture),
        montantRestant: Number(form.montantRestant),
      };
      if (editItem) {
        await api.updateBonCommande(editItem.id, payload);
        toast.success("Bon de commande mis à jour.");
      } else {
        await api.createBonCommande(payload);
        toast.success("Bon de commande créé.");
      }
      refetch();
      closeModal();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, numeroBc: string) {
    if (!confirm(`Supprimer le bon de commande « ${numeroBc} » ?`)) return;
    try {
      await api.deleteBonCommande(id);
      refetch();
      toast.success("Bon de commande supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

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
      refetch();
    } catch {
      toast.error("Erreur lors de l'import.");
    }
    e.target.value = "";
  }

  if (loading) return <Loader label="Chargement du suivi paiement…" />;

  const bons    = data?.bons ?? [];
  const totaux  = data?.totaux;

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
            <Button onClick={openCreate}><Plus /> Nouveau BC</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total PO"         value={formatMontant(totaux?.totalPo      ?? 0)} icon={<Wallet />}  tone="var(--color-brand-500)" />
        <StatCard label="Facturé HT"       value={formatMontant(totaux?.totalFacture ?? 0)} icon={<Receipt />} tone="var(--color-ok)" />
        <StatCard label="Non facturé"      value={formatMontant(totaux?.totalRestant ?? 0)} icon={<Wallet />}  tone="var(--color-warn)" />
        <StatCard label="Bons de commande" value={totaux?.nbBons ?? 0}                      icon={<Receipt />} tone="var(--color-rest)" />
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
              <TH className="text-right">Actions</TH>
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
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Modifier" onClick={() => openEdit(b)}
                          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" title="Supprimer" onClick={() => handleDelete(b.id, b.numeroBc)}
                          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le bon de commande" : "Nouveau bon de commande"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>N° BC <span className="text-danger">*</span></Label>
              <Input value={form.numeroBc} onChange={(e) => set("numeroBc", e.target.value)} placeholder="BC-2024-001" required />
            </div>
            <div>
              <Label>Projet associé</Label>
              <Input value={form.projetAssocie} onChange={(e) => set("projetAssocie", e.target.value)} placeholder="Projet GF72" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Montant PO <span className="text-danger">*</span></Label>
              <Input type="number" min={0} value={form.montantPo} onChange={(e) => set("montantPo", e.target.value)} placeholder="0" required />
            </div>
            <div>
              <Label>Montant facturé</Label>
              <Input type="number" min={0} value={form.montantFacture} onChange={(e) => set("montantFacture", e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Montant restant</Label>
              <Input type="number" min={0} value={form.montantRestant} onChange={(e) => set("montantRestant", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
