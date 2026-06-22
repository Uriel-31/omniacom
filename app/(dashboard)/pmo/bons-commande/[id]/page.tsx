"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { EmptyState } from "@/components/app/primitives/misc";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { formatMontant, formatDateShort } from "@/lib/utils";
import type { LigneFacturation } from "@/types";

const STATUT_PAIEMENT_LABEL: Record<string, string> = {
  PAYE:       "Payé",
  EN_ATTENTE: "En attente",
  ANNULE:     "Annulé",
};
const STATUT_PAIEMENT_TONE: Record<string, "ok" | "warn" | "danger"> = {
  PAYE:       "ok",
  EN_ATTENTE: "warn",
  ANNULE:     "danger",
};

export default function BonCommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: bc,    loading: lb } = useAsync(() => api.bonCommande(id), [id]);
  const { data: ldata, loading: ll } = useAsync(() => api.lignesFacturation(id), [id]);

  const [lignes, setLignes] = useState<LigneFacturation[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [form, setForm]           = useState({ description: "", montantHt: "", dateFacture: "", statutPaiement: "EN_ATTENTE" });

  useEffect(() => { if (ldata) setLignes(ldata); }, [ldata]);

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleAddLigne(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await api.createLigneFacturation({
        bonDeCommandeId: id,
        montantHt:       Number(form.montantHt) || 0,
        dateFacture:     form.dateFacture || undefined,
        description:     form.description || undefined,
        statutPaiement:  form.statutPaiement,
      });
      setLignes((prev) => [...prev, created]);
      toast.success("Ligne ajoutée.");
      setOpenModal(false);
      setForm({ description: "", montantHt: "", dateFacture: "", statutPaiement: "EN_ATTENTE" });
    } catch {
      toast.error("Erreur lors de l'ajout.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteLigne(ligneId: number) {
    if (!confirm("Supprimer cette ligne de facturation ?")) return;
    try {
      await api.deleteLigneFacturation(ligneId);
      setLignes((prev) => prev.filter((l) => l.id !== ligneId));
      toast.success("Ligne supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  if (lb) return <Loader label="Chargement du bon de commande…" />;
  if (!bc) return <div className="py-16 text-center text-muted">Bon de commande introuvable.</div>;

  const solde = bc.montantRestant === 0;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg p-2 text-faint transition-colors hover:bg-canvas hover:text-ink">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink font-mono">{bc.numeroBc}</h1>
          <p className="text-sm text-muted">{bc.projetAssocie ?? "Aucun projet associé"}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge tone={solde ? "ok" : "warn"} dot>{solde ? "Soldé" : "En cours"}</Badge>
          <Button
            variant="outline"
            onClick={async () => {
              const { generateBcPdf } = await import("@/lib/export");
              generateBcPdf(bc, lignes);
            }}
          >
            <FileText /> Générer Rapport PDF
          </Button>
        </div>
      </div>

      {/* Informations financières */}
      <Card className="mb-6">
        <CardHeader title="Informations financières" />
        <div className="border-t border-line px-5 py-4">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            {[
              ["Numéro BC",       bc.numeroBc],
              ["Projet associé",  bc.projetAssocie ?? "—"],
              ["Statut",          solde ? "Soldé" : "En cours"],
              ["Montant PO",      formatMontant(bc.montantPo)],
              ["Montant facturé", formatMontant(bc.montantFacture)],
              ["Montant restant", formatMontant(bc.montantRestant)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      {/* Lignes de facturation */}
      <Card>
        <CardHeader
          title="Lignes de facturation"
          icon={<FileText />}
          action={
            <Button size="sm" onClick={() => setOpenModal(true)}>
              <Plus /> Ajouter une ligne
            </Button>
          }
        />
        <div className="border-t border-line">
          {ll ? (
            <Loader />
          ) : lignes.length === 0 ? (
            <EmptyState title="Aucune ligne de facturation" hint="Ajoutez des lignes pour détailler les paiements." />
          ) : (
            <Table>
              <THead>
                <TH>Description</TH>
                <TH className="text-right">Montant HT</TH>
                <TH>Date facture</TH>
                <TH>Statut paiement</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <TBody>
                {lignes.map((l) => {
                  const tone = STATUT_PAIEMENT_TONE[l.statutPaiement] ?? "rest";
                  const label = STATUT_PAIEMENT_LABEL[l.statutPaiement] ?? l.statutPaiement;
                  return (
                    <TR key={l.id}>
                      <TD className="text-ink">{l.description ?? "—"}</TD>
                      <TD className="text-right tabular font-medium text-ink">{formatMontant(l.montantHt)}</TD>
                      <TD className="tabular text-muted">{formatDateShort(l.dateFacture)}</TD>
                      <TD>
                        <Badge tone={tone} dot>{label}</Badge>
                      </TD>
                      <TD className="text-right">
                        <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteLigne(l.id)}>
                          <Trash2 className="size-4" />
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Modal ajout ligne */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Ajouter une ligne de facturation">
        <form className="flex flex-col gap-4" onSubmit={handleAddLigne}>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Travaux phase 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Montant HT (FCFA)</Label>
              <Input type="number" min={0} value={form.montantHt} onChange={(e) => set("montantHt", e.target.value)} placeholder="15000000" required />
            </div>
            <div>
              <Label>Date facture</Label>
              <Input type="date" value={form.dateFacture} onChange={(e) => set("dateFacture", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Statut paiement</Label>
            <select value={form.statutPaiement} onChange={(e) => set("statutPaiement", e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink-soft focus:border-brand-400 focus:outline-none">
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYE">Payé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? "Ajout…" : "Ajouter"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
