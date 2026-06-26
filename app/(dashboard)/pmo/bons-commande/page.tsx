"use client";

import { useState, useCallback, useMemo } from "react";
import { Receipt, Plus, Eye, Trash2, Pencil, Wallet, CheckCircle2, Clock, FileDown, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader, EmptyState, SearchInput } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatMontant, isBcSolde, sumAmounts } from "@/lib/utils";
import type { BonDeCommande } from "@/types";

const EMPTY = { numeroBc: "", projetAssocie: "", montantPo: "", montantFacture: "", montantRestant: "" };

export default function BonsCommandePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.bonsCommande(), [refreshKey]);
  const [open, setOpen]     = useState(false);
  const [editItem, setEditItem] = useState<BonDeCommande | null>(null);
  const [busy, setBusy]     = useState(false);
  const [q, setQ]           = useState("");
  const [form, setForm]     = useState(EMPTY);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const allItems = data ?? [];
  const rows = useMemo(
    () => allItems.filter((b) =>
      `${b.numeroBc} ${b.projetAssocie ?? ""}`.toLowerCase().includes(q.toLowerCase()),
    ),
    [allItems, q],
  );

  const totalPO       = sumAmounts(allItems, (b) => b.montantPo);
  const totalFacture  = sumAmounts(allItems, (b) => b.montantFacture);
  const totalRestant  = sumAmounts(allItems, (b) => b.montantRestant);
  const tauxFactu     = totalPO ? (totalFacture / totalPO) * 100 : 0;
  const nbSoldes      = allItems.filter((b) => isBcSolde(b.montantRestant)).length;

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }
  function resetForm() { setForm(EMPTY); }

  function openCreate() { setEditItem(null); resetForm(); setOpen(true); }

  function openEdit(b: BonDeCommande) {
    setEditItem(b);
    setForm({
      numeroBc:       b.numeroBc,
      projetAssocie:  b.projetAssocie ?? "",
      montantPo:      String(b.montantPo),
      montantFacture: String(b.montantFacture),
      montantRestant: String(b.montantRestant),
    });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); resetForm(); }

  async function handleExcelExport() {
    const { exportExcel } = await import("@/lib/export");
    exportExcel(
      rows.map((b) => ({
        "N° BC":           b.numeroBc,
        "Projet associé":  b.projetAssocie ?? "—",
        "Montant PO":      b.montantPo,
        "Montant facturé": b.montantFacture,
        "Montant restant": b.montantRestant,
        "Statut":          isBcSolde(b.montantRestant) ? "Soldé" : "En cours",
      })),
      "bons-de-commande",
    );
  }

  async function handlePdfExport() {
    const { exportPdf } = await import("@/lib/export");
    exportPdf(
      "Bons de commande",
      ["N° BC", "Projet associé", "Montant PO", "Facturé", "Restant", "Statut"],
      rows.map((b) => [
        b.numeroBc,
        b.projetAssocie ?? "—",
        b.montantPo,
        b.montantFacture,
        b.montantRestant,
        isBcSolde(b.montantRestant) ? "Soldé" : "En cours",
      ]),
      "bons-de-commande",
    );
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      numeroBc:       form.numeroBc,
      projetAssocie:  form.projetAssocie || undefined,
      montantPo:      Number(form.montantPo)      || 0,
      montantFacture: Number(form.montantFacture) || 0,
      montantRestant: Number(form.montantRestant) || 0,
    };
    try {
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
      toast.error(editItem ? "Erreur lors de la modification." : "Erreur lors de la création.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, num: string) {
    if (!confirm(`Supprimer le bon de commande « ${num} » ?`)) return;
    try {
      await api.deleteBonCommande(id);
      refetch();
      toast.success("Bon de commande supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  if (loading) return <Loader label="Chargement des bons de commande…" />;

  return (
    <>
      <PageHeader
        title="Bons de commande"
        subtitle="Suivi financier des PO : facturé, restant et taux de recouvrement."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Excel</Button>
            <Button variant="outline" onClick={handlePdfExport}><FileText /> PDF</Button>
            <Button onClick={openCreate}><Plus /> Nouveau BC</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Montant total PO"   value={formatMontant(totalPO)}      icon={<Wallet />}        tone="var(--color-rest)" />
        <StatCard label="Facturé"            value={formatMontant(totalFacture)}  percent={tauxFactu}      tone="var(--color-ok)" />
        <StatCard label="Restant à payer"    value={formatMontant(totalRestant)} icon={<Clock />}         tone="var(--color-warn)" />
        <StatCard label="BC soldés"          value={nbSoldes}                    icon={<CheckCircle2 />}  tone="var(--color-ok)" />
      </div>

      <Card>
        <CardHeader
          title="Détail des bons de commande"
          icon={<Receipt />}
          action={<SearchInput value={q} onChange={setQ} placeholder="N° BC, projet…" className="w-52" />}
        />
        <div className="border-t border-line">
          {rows.length === 0 ? (
            <EmptyState title="Aucun bon de commande" hint="Cliquez sur « Nouveau BC » pour en créer un." />
          ) : (
            <Table>
              <THead>
                <TH>N° BC</TH>
                <TH>Projet associé</TH>
                <TH className="text-right">Montant PO</TH>
                <TH className="text-right">Facturé HT</TH>
                <TH className="text-right">Restant</TH>
                <TH>État</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <TBody>
                {rows.map((b) => {
                  const solde = isBcSolde(b.montantRestant);
                  return (
                    <TR key={b.id}>
                      <TD className="font-mono font-medium text-ink">{b.numeroBc}</TD>
                      <TD className="text-muted">{b.projetAssocie ?? "—"}</TD>
                      <TD className="text-right tabular">{formatMontant(b.montantPo)}</TD>
                      <TD className="text-right tabular">{formatMontant(b.montantFacture)}</TD>
                      <TD className="text-right tabular font-medium">
                        <span className={solde ? "text-ok" : "text-warn"}>
                          {formatMontant(b.montantRestant)}
                        </span>
                      </TD>
                      <TD>
                        <Badge tone={solde ? "ok" : "warn"} dot>
                          {solde ? "Soldé" : "En cours"}
                        </Badge>
                      </TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/pmo/bons-commande/${b.id}`}>
                            <button type="button" title="Voir le détail" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                              <Eye className="size-4" />
                            </button>
                          </Link>
                          <button type="button" title="Modifier" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink" onClick={() => openEdit(b)}>
                            <Pencil className="size-4" />
                          </button>
                          <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(b.id, b.numeroBc)}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le bon de commande" : "Nouveau bon de commande"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numéro BC</Label>
              <Input value={form.numeroBc} onChange={(e) => set("numeroBc", e.target.value)} placeholder="BC-2401917" required />
            </div>
            <div>
              <Label>Projet associé</Label>
              <Input value={form.projetAssocie} onChange={(e) => set("projetAssocie", e.target.value)} placeholder="Extension Réseau Sud" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Montant PO (FCFA)</Label>
              <Input type="number" min={0} value={form.montantPo} onChange={(e) => set("montantPo", e.target.value)} placeholder="45000000" required />
            </div>
            <div>
              <Label>Montant facturé</Label>
              <Input type="number" min={0} value={form.montantFacture} onChange={(e) => set("montantFacture", e.target.value)} placeholder="30000000" />
            </div>
            <div>
              <Label>Montant restant</Label>
              <Input type="number" min={0} value={form.montantRestant} onChange={(e) => set("montantRestant", e.target.value)} placeholder="15000000" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? (editItem ? "Modification…" : "Enregistrement…") : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
