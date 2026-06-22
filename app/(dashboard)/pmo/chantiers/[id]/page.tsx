"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { EmptyState } from "@/components/app/primitives/misc";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { CHANTIER_TONE, CHANTIER_STATUS_LABEL, ETAPE_STATUS_LABEL } from "@/lib/constants";
import { formatDateShort, calcEcart } from "@/lib/utils";
import type { EtapeChantier, EtapeChantierStatus } from "@/types";

const ETAPE_TONE: Record<EtapeChantierStatus, "ok" | "warn" | "danger" | "info" | "rest"> = {
  EN_ATTENTE: "rest",
  EN_COURS:   "info",
  TERMINE:    "ok",
  EN_RETARD:  "danger",
};
const ETAPE_STATUTS: EtapeChantierStatus[] = ["EN_ATTENTE", "EN_COURS", "TERMINE", "EN_RETARD"];

function EcartBadge({ jours }: { jours?: number }) {
  if (jours === undefined) return <span className="text-faint">—</span>;
  if (jours > 0) return <span className="font-semibold text-[var(--color-danger)]">+{jours} j</span>;
  if (jours < 0) return <span className="font-semibold text-[var(--color-ok)]">{jours} j</span>;
  return <span className="text-muted">0 j</span>;
}

export default function ChantierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: chantier, loading: lc } = useAsync(() => api.chantier(id), [id]);
  const { data: etapesData, loading: le } = useAsync(() => api.etapesChantier(id), [id]);

  const [etapes, setEtapes] = useState<EtapeChantier[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [busy, setBusy]           = useState(false);
  const [form, setForm]           = useState({ nomEtape: "", datePlanifiee: "", status: "EN_ATTENTE" as EtapeChantierStatus });

  useEffect(() => { if (etapesData) setEtapes(etapesData); }, [etapesData]);

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleAddEtape(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await api.createEtapeChantier({
        chantierId:    id,
        nomEtape:      form.nomEtape,
        datePlanifiee: form.datePlanifiee || undefined,
        status:        form.status,
      });
      setEtapes((prev) => [...prev, created]);
      toast.success("Étape ajoutée.");
      setOpenModal(false);
      setForm({ nomEtape: "", datePlanifiee: "", status: "EN_ATTENTE" });
    } catch {
      toast.error("Erreur lors de l'ajout.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEtape(etapeId: number, nom: string) {
    if (!confirm(`Supprimer l'étape « ${nom} » ?`)) return;
    try {
      await api.deleteEtapeChantier(etapeId);
      setEtapes((prev) => prev.filter((e) => e.id !== etapeId));
      toast.success("Étape supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  if (lc) return <Loader label="Chargement du chantier…" />;
  if (!chantier) return (
    <div className="py-16 text-center text-muted">Chantier introuvable.</div>
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg p-2 text-faint transition-colors hover:bg-canvas hover:text-ink">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{chantier.nomSite}</h1>
          <p className="text-sm text-muted">{chantier.codeSite} · {chantier.typeSite}</p>
        </div>
        <div className="ml-auto">
          <Badge tone={CHANTIER_TONE[chantier.status]} dot>
            {CHANTIER_STATUS_LABEL[chantier.status]}
          </Badge>
        </div>
      </div>

      {/* Informations générales */}
      <Card className="mb-6">
        <CardHeader title="Informations générales" />
        <div className="border-t border-line px-5 py-4">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            {[
              ["Entreprise",             chantier.entreprise],
              ["Code site",              chantier.codeSite],
              ["Type de site",           chantier.typeSite],
              ["Date GO",                formatDateShort(chantier.dateGo)],
              ["Avancement planifié",    chantier.avancementPlanifie !== undefined ? `${chantier.avancementPlanifie}%` : "—"],
              ["Avancement réel",        chantier.avancementReel     !== undefined ? `${chantier.avancementReel}%`     : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      {/* Étapes du chantier */}
      <Card>
        <CardHeader
          title="Étapes du chantier"
          icon={<ClipboardList />}
          action={
            <Button size="sm" onClick={() => setOpenModal(true)}>
              <Plus /> Ajouter une étape
            </Button>
          }
        />
        <div className="border-t border-line">
          {le ? (
            <Loader />
          ) : etapes.length === 0 ? (
            <EmptyState title="Aucune étape" hint="Ajoutez des étapes pour suivre l'avancement." />
          ) : (
            <Table>
              <THead>
                <TH>Étape</TH>
                <TH>Statut</TH>
                <TH>Date prévue</TH>
                <TH>Date réelle</TH>
                <TH className="text-right">Écart</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <TBody>
                {etapes.map((e) => (
                  <TR key={e.id}>
                    <TD className="font-medium text-ink">{e.nomEtape}</TD>
                    <TD>
                      <Badge tone={ETAPE_TONE[e.status]} dot>
                        {ETAPE_STATUS_LABEL[e.status]}
                      </Badge>
                    </TD>
                    <TD className="tabular text-muted">{formatDateShort(e.datePlanifiee)}</TD>
                    <TD className="tabular text-muted">{formatDateShort(e.dateReelle)}</TD>
                    <TD className="text-right tabular">
                      <EcartBadge jours={calcEcart(e.datePlanifiee, e.dateReelle)} />
                    </TD>
                    <TD className="text-right">
                      <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteEtape(e.id, e.nomEtape)}>
                        <Trash2 className="size-4" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Modal ajout étape */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Ajouter une étape">
        <form className="flex flex-col gap-4" onSubmit={handleAddEtape}>
          <div>
            <Label>Nom de l'étape</Label>
            <Input value={form.nomEtape} onChange={(e) => set("nomEtape", e.target.value)} placeholder="APD submission" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date planifiée</Label>
              <Input type="date" value={form.datePlanifiee} onChange={(e) => set("datePlanifiee", e.target.value)} />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full">
                {ETAPE_STATUTS.map((s) => <option key={s} value={s}>{ETAPE_STATUS_LABEL[s]}</option>)}
              </Select>
            </div>
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
