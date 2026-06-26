"use client";

import { useState, useCallback, useMemo } from "react";
import { Building2, Plus, Pencil, Trash2, Eye, FileDown, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { CHANTIER_TONE, CHANTIER_STATUS_LABEL } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { Chantier, ChantierStatus } from "@/types";

const STATUTS: ChantierStatus[] = ["ON_GOING", "DONE", "NEED_CLEAN_SITE", "LANDLORD_ISSUE", "APD_ON_GOING"];

const EMPTY: Omit<Chantier, "id" | "etapes" | "bonsDeCommande"> = {
  entreprise: "", codeSite: "", nomSite: "", typeSite: "", status: "ON_GOING",
};

export default function ChantiersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.chantiers(), [refreshKey]);
  const [open, setOpen]     = useState(false);
  const [editItem, setEditItem] = useState<Chantier | null>(null);
  const [busy, setBusy]     = useState(false);
  const [q, setQ]           = useState("");
  const [form, setForm]     = useState({ ...EMPTY, avancementPlanifie: "", avancementReel: "", dateGo: "" });

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const allItems = data ?? [];
  const rows = useMemo(
    () => allItems.filter((c) =>
      `${c.nomSite} ${c.codeSite} ${c.entreprise}`.toLowerCase().includes(q.toLowerCase()),
    ),
    [allItems, q],
  );

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }
  function resetForm() { setForm({ ...EMPTY, avancementPlanifie: "", avancementReel: "", dateGo: "" }); }

  function openCreate() { setEditItem(null); resetForm(); setOpen(true); }

  function openEdit(c: Chantier) {
    setEditItem(c);
    setForm({
      entreprise: c.entreprise, codeSite: c.codeSite, nomSite: c.nomSite,
      typeSite: c.typeSite, status: c.status,
      avancementPlanifie: c.avancementPlanifie !== undefined ? String(c.avancementPlanifie) : "",
      avancementReel:     c.avancementReel     !== undefined ? String(c.avancementReel)     : "",
      dateGo:             c.dateGo ?? "",
    });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); resetForm(); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      entreprise: form.entreprise,
      codeSite:   form.codeSite,
      nomSite:    form.nomSite,
      typeSite:   form.typeSite,
      status:     form.status as ChantierStatus,
      avancementPlanifie: form.avancementPlanifie ? Number(form.avancementPlanifie) : undefined,
      avancementReel:     form.avancementReel     ? Number(form.avancementReel)     : undefined,
      dateGo:             form.dateGo             || undefined,
    };
    try {
      if (editItem) {
        await api.updateChantier(editItem.id, payload);
        toast.success("Chantier mis à jour.");
      } else {
        await api.createChantier(payload);
        toast.success("Chantier créé.");
      }
      refetch();
      closeModal();
    } catch {
      toast.error(editItem ? "Erreur lors de la modification." : "Erreur lors de la création.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExcelExport() {
    try {
      await api.exportChantiersExcel();
      toast.success("Export Excel téléchargé.");
    } catch {
      toast.error("Erreur lors de l'export.");
    }
  }

  async function handlePdfExport() {
    const { exportPdf } = await import("@/lib/export");
    exportPdf(
      "Suivi des chantiers",
      ["Code Site", "Nom Site", "Entreprise", "Type", "Statut", "Av. planifié", "Av. réel", "Date GO"],
      rows.map((c) => [
        c.codeSite,
        c.nomSite,
        c.entreprise,
        c.typeSite,
        CHANTIER_STATUS_LABEL[c.status],
        c.avancementPlanifie !== undefined ? `${c.avancementPlanifie}%` : "—",
        c.avancementReel     !== undefined ? `${c.avancementReel}%`     : "—",
        formatDateShort(c.dateGo),
      ]),
      "chantiers",
    );
  }

  async function handleDelete(id: number, nom: string) {
    if (!confirm(`Supprimer le chantier « ${nom} » ?`)) return;
    try {
      await api.deleteChantier(id);
      refetch();
      toast.success("Chantier supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Chantiers"
        subtitle="Gestion et suivi des chantiers de déploiement télécom."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Excel</Button>
            <Button variant="outline" onClick={handlePdfExport}><FileText /> PDF</Button>
            <Button onClick={openCreate}><Plus /> Nouveau chantier</Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Liste des chantiers"
          icon={<Building2 />}
          action={<SearchInput value={q} onChange={setQ} placeholder="Rechercher…" className="w-56" />}
        />
        <div className="border-t border-line">
          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <EmptyState title="Aucun chantier" hint="Cliquez sur « Nouveau chantier » pour en créer un." />
          ) : (
            <Table>
              <THead>
                <TH>Code</TH>
                <TH>Nom du site</TH>
                <TH>Entreprise</TH>
                <TH>Type</TH>
                <TH>Avancement réel</TH>
                <TH>Date GO</TH>
                <TH>Statut</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <TBody>
                {rows.map((c) => (
                  <TR key={c.id}>
                    <TD><span className="font-mono text-xs text-muted">{c.codeSite}</span></TD>
                    <TD className="font-medium text-ink">{c.nomSite}</TD>
                    <TD className="text-muted">{c.entreprise}</TD>
                    <TD className="text-muted">{c.typeSite}</TD>
                    <TD>
                      {c.avancementReel !== undefined ? (
                        <span className="font-semibold text-ink">{c.avancementReel}%</span>
                      ) : "—"}
                    </TD>
                    <TD className="tabular text-muted">{formatDateShort(c.dateGo)}</TD>
                    <TD>
                      <Badge tone={CHANTIER_TONE[c.status]} dot>
                        {CHANTIER_STATUS_LABEL[c.status]}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/pmo/chantiers/${c.id}`}>
                          <button type="button" title="Voir le détail" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                            <Eye className="size-4" />
                          </button>
                        </Link>
                        <button type="button" title="Modifier" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink" onClick={() => openEdit(c)}>
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(c.id, c.nomSite)}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le chantier" : "Nouveau chantier"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entreprise</Label>
              <Input value={form.entreprise} onChange={(e) => set("entreprise", e.target.value)} placeholder="OMNIACOM" required />
            </div>
            <div>
              <Label>Code Site</Label>
              <Input value={form.codeSite} onChange={(e) => set("codeSite", e.target.value)} placeholder="CM-DLA-TWR-07" required />
            </div>
          </div>
          <div>
            <Label>Nom du site</Label>
            <Input value={form.nomSite} onChange={(e) => set("nomSite", e.target.value)} placeholder="Tour Douala 07" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type de site</Label>
              <Input value={form.typeSite} onChange={(e) => set("typeSite", e.target.value)} placeholder="Greenfield / Rooftop" required />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full">
                {STATUTS.map((s) => <option key={s} value={s}>{CHANTIER_STATUS_LABEL[s]}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Avancement planifié (%)</Label>
              <Input type="number" min={0} max={100} value={form.avancementPlanifie} onChange={(e) => set("avancementPlanifie", e.target.value)} placeholder="75" />
            </div>
            <div>
              <Label>Avancement réel (%)</Label>
              <Input type="number" min={0} max={100} value={form.avancementReel} onChange={(e) => set("avancementReel", e.target.value)} placeholder="60" />
            </div>
            <div>
              <Label>Date GO</Label>
              <Input type="date" value={form.dateGo} onChange={(e) => set("dateGo", e.target.value)} />
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
