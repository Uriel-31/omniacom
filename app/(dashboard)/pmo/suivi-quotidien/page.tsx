"use client";

import { useState, useCallback } from "react";
import { FileDown, Upload, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import { CHANTIER_STATUS_LABEL } from "@/lib/constants";
import type { Chantier, EtapeChantier, ChantierStatus } from "@/types";

const MILESTONE_CODES = ["SURVEY", "APD", "MOBILIZATION", "IMPLANTATION", "EXCAVATION", "FINAL_RFI"];
const STATUTS: ChantierStatus[] = ["ON_GOING", "DONE", "NEED_CLEAN_SITE", "LANDLORD_ISSUE", "APD_ON_GOING"];
const EMPTY_FORM = { codeSite: "", nomSite: "", entreprise: "", typeSite: "", status: "ON_GOING" as ChantierStatus, dateGo: "" };

function etapeByCode(etapes: EtapeChantier[] | undefined, code: string) {
  return etapes?.find((e) => e.codeEtape === code);
}

export default function SuiviQuotidienPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.dailyProgress(), [refreshKey]);
  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState<Chantier | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [busy, setBusy]         = useState(false);

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }
  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY_FORM); }
  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setOpen(true); }

  function openEdit(c: Chantier) {
    setEditItem(c);
    setForm({
      codeSite:   c.codeSite,
      nomSite:    c.nomSite,
      entreprise: c.entreprise,
      typeSite:   c.typeSite,
      status:     c.status,
      dateGo:     c.dateGo?.slice(0, 10) ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        codeSite:   form.codeSite,
        nomSite:    form.nomSite,
        entreprise: form.entreprise,
        typeSite:   form.typeSite,
        status:     form.status,
        dateGo:     form.dateGo || undefined,
      };
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
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setBusy(false);
    }
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

  async function handleExport() {
    const { exportPmoExcel } = await import("@/lib/export");
    const rows = data ?? [];
    exportPmoExcel(
      rows.map((c: Chantier) => {
        const base: Record<string, string> = {
          "Code Site": c.codeSite,
          "Nom Site":  c.nomSite,
          "Statut":    CHANTIER_STATUS_LABEL[c.status],
          "Date GO":   formatDateShort(c.dateGo) ?? "—",
        };
        for (const code of MILESTONE_CODES) {
          const e = etapeByCode(c.etapesChantier, code);
          const label = code.replace(/_/g, " ");
          base[`${label} - Planifié`] = e?.datePlanifiee ? formatDateShort(e.datePlanifiee) ?? "—" : "—";
          base[`${label} - Réel`]     = e?.dateReelle    ? formatDateShort(e.dateReelle)    ?? "—" : "—";
        }
        return base;
      }),
      "daily-reporting-tracker",
    );
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.importDailyTracker(file);
      toast.success(`${result.imported} chantier(s) importé(s).`);
      refetch();
    } catch {
      toast.error("Erreur lors de l'import.");
    }
    e.target.value = "";
  }

  async function saveEtapeDate(etapeId: number, field: "datePlanifiee" | "dateReelle", value: string) {
    try {
      await api.updateEtapeChantier(etapeId, { [field]: value || undefined });
      refetch();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  }

  if (loading) return <Loader label="Chargement du suivi quotidien…" />;

  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title="Suivi quotidien CW"
        subtitle="Daily Reporting Tracker — jalons planifiés vs réels."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:bg-canvas">
              <Upload className="size-4" /> Import Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <Button variant="outline" onClick={handleExport}><FileDown /> Export Excel</Button>
            <Button onClick={openCreate}><Plus /> Nouveau chantier</Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Tracker civil work" icon={<Building2 />} />
        <div className="overflow-x-auto border-t border-line">
          <table className="min-w-[1400px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">GO</th>
                {MILESTONE_CODES.map((c) => (
                  <th key={c} className="px-3 py-2 whitespace-nowrap">{c.replace(/_/g, " ")}</th>
                ))}
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c: Chantier) => (
                <tr key={c.id} className="border-b border-line hover:bg-canvas/50">
                  <td className="px-3 py-2 font-medium text-ink">{c.nomSite}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{c.codeSite}</td>
                  <td className="px-3 py-2 text-muted">{CHANTIER_STATUS_LABEL[c.status]}</td>
                  <td className="px-3 py-2 tabular text-muted">{formatDateShort(c.dateGo)}</td>
                  {MILESTONE_CODES.map((code) => {
                    const e = etapeByCode(c.etapesChantier, code);
                    if (!e || e.status === "NON_APPLICABLE") {
                      return <td key={code} className="px-3 py-2 text-center text-faint">N/A</td>;
                    }
                    return (
                      <td key={code} className="px-2 py-2">
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            className="h-7 rounded border border-line bg-surface px-1 text-xs"
                            value={e.datePlanifiee?.slice(0, 10) ?? ""}
                            onChange={(ev) => saveEtapeDate(e.id, "datePlanifiee", ev.target.value)}
                          />
                          <input
                            type="date"
                            className="h-7 rounded border border-line bg-surface px-1 text-xs"
                            value={e.dateReelle?.slice(0, 10) ?? ""}
                            onChange={(ev) => saveEtapeDate(e.id, "dateReelle", ev.target.value)}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Modifier" onClick={() => openEdit(c)}
                        className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" title="Supprimer" onClick={() => handleDelete(c.id, c.nomSite)}
                        className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le chantier" : "Nouveau chantier"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code Site</Label>
              <Input value={form.codeSite} onChange={(e) => set("codeSite", e.target.value)} placeholder="CM-DLA-TWR-07" required />
            </div>
            <div>
              <Label>Nom du site</Label>
              <Input value={form.nomSite} onChange={(e) => set("nomSite", e.target.value)} placeholder="Tour Douala 07" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entreprise</Label>
              <Input value={form.entreprise} onChange={(e) => set("entreprise", e.target.value)} placeholder="OMNIACOM" required />
            </div>
            <div>
              <Label>Type de site</Label>
              <Input value={form.typeSite} onChange={(e) => set("typeSite", e.target.value)} placeholder="Greenfield / Rooftop" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full">
                {STATUTS.map((s) => <option key={s} value={s}>{CHANTIER_STATUS_LABEL[s]}</option>)}
              </Select>
            </div>
            <div>
              <Label>Date GO</Label>
              <Input type="date" value={form.dateGo} onChange={(e) => set("dateGo", e.target.value)} />
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
