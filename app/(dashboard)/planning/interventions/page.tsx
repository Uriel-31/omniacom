"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, FileDown, FileText, Pencil, Trash2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, FilterPills, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import {
  INTERVENTION_TONE,
  INTERVENTION_STATUT_LABEL,
  INTERVENTION_TYPE_LABEL,
} from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { Intervention, InterventionStatut, InterventionTypeAction } from "@/types";

const FILTRE_OPTIONS = [
  { label: "Tous",     value: "TOUS"     },
  { label: "Planifié", value: "PLANIFIE" },
  { label: "En cours", value: "EN_COURS" },
  { label: "Terminé",  value: "TERMINE"  },
] as const;
type Filtre = (typeof FILTRE_OPTIONS)[number]["value"];

const ALL_STATUTS: InterventionStatut[]   = ["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE", "REPORTE"];
const ALL_ACTIONS: InterventionTypeAction[] = ["MAINTENANCE", "DEPANNAGE", "INSTALLATION", "AUDIT"];

export default function InterventionsPage() {
  const { data, loading }         = useAsync(() => api.interventions(), []);
  const { data: sites }           = useAsync(() => api.sites(), []);
  const { data: techniciens }     = useAsync(() => api.techniciens(), []);

  const [items, setItems]       = useState<Intervention[]>([]);
  const [q, setQ]               = useState("");
  const [filtre, setFiltre]     = useState<Filtre>("TOUS");
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState<Intervention | null>(null);
  const [busy, setBusy]         = useState(false);
  const [siteId, setSiteId]     = useState("");
  const [techId, setTechId]     = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [action, setAction]     = useState<InterventionTypeAction>("MAINTENANCE");
  const [editStatut, setEditStatut] = useState<InterventionStatut>("PLANIFIE");
  const [editAction, setEditAction] = useState<InterventionTypeAction>("MAINTENANCE");

  useEffect(() => { if (data) setItems(data); }, [data]);

  function getSiteNom(id: number) {
    return sites?.find((s) => s.id === id)?.nom ?? `Site #${id}`;
  }
  function getTech(id: number) {
    return techniciens?.find((t) => t.id === id);
  }

  const rows = useMemo(() => {
    let r = items;
    if (filtre !== "TOUS") r = r.filter((i) => i.statut === (filtre as InterventionStatut));
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((i) => {
        const siteNom = getSiteNom(i.siteId).toLowerCase();
        const tech    = getTech(i.technicienId);
        const techNom = tech ? `${tech.prenom} ${tech.nom}`.toLowerCase() : "";
        return siteNom.includes(ql) || techNom.includes(ql);
      });
    }
    return r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, filtre, sites, techniciens]);

  function openEdit(i: Intervention) {
    setEditItem(i);
    setEditStatut(i.statut);
    setEditAction(i.typeAction);
  }

  function closeEdit() { setEditItem(null); }

  async function handleUpdate(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!editItem) return;
    setBusy(true);
    try {
      const updated = await api.updateIntervention(editItem.id, { statut: editStatut, typeAction: editAction });
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...updated } : i));
      toast.success("Intervention mise à jour.");
      closeEdit();
    } catch {
      toast.error("Erreur lors de la modification.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createIntervention({
        siteId:        Number(siteId),
        technicienId:  Number(techId),
        timestampDebut: new Date(dateDebut).toISOString(),
        typeAction:    action,
        statut:        "PLANIFIE",
      });
      toast.success("Intervention planifiée.");
      setOpen(false);
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette intervention ?")) return;
    try {
      await api.deleteIntervention(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Intervention supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  async function handleExcelExport() {
    const { exportExcel } = await import("@/lib/export");
    exportExcel(
      rows.map((i) => {
        const siteNom = i.site?.nom ?? getSiteNom(i.siteId);
        const tech    = i.technicien ?? getTech(i.technicienId);
        const techNom = tech ? `${tech.prenom} ${tech.nom}` : `#${i.technicienId}`;
        return {
          "Technicien":  techNom,
          "Site":        siteNom,
          "Date début":  formatDateShort(i.timestampDebut),
          "Type":        INTERVENTION_TYPE_LABEL[i.typeAction],
          "Statut":      INTERVENTION_STATUT_LABEL[i.statut],
        };
      }),
      "interventions",
    );
  }

  async function handlePdfExport() {
    const { exportPdf } = await import("@/lib/export");
    exportPdf(
      "Plannings d'intervention",
      ["Technicien", "Site", "Date début", "Type", "Statut"],
      rows.map((i) => {
        const siteNom = i.site?.nom ?? getSiteNom(i.siteId);
        const tech    = i.technicien ?? getTech(i.technicienId);
        const techNom = tech ? `${tech.prenom} ${tech.nom}` : `#${i.technicienId}`;
        return [techNom, siteNom, formatDateShort(i.timestampDebut), INTERVENTION_TYPE_LABEL[i.typeAction], INTERVENTION_STATUT_LABEL[i.statut]];
      }),
      "interventions",
    );
  }

  const pillLabels = FILTRE_OPTIONS.map((f) => f.label) as [string, ...string[]];
  const selectedLabel = FILTRE_OPTIONS.find((f) => f.value === filtre)!.label;

  return (
    <>
      <PageHeader
        title="Plannings d'intervention"
        subtitle="Affectation des techniciens aux sites, vue tableau."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Excel</Button>
            <Button variant="outline" onClick={handlePdfExport}><FileText /> PDF</Button>
            <Button onClick={() => setOpen(true)}><Plus /> Nouvelle intervention</Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <FilterPills
            options={pillLabels}
            value={selectedLabel}
            onChange={(label) => {
              const found = FILTRE_OPTIONS.find((f) => f.label === label);
              if (found) setFiltre(found.value);
            }}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher (site, technicien)…" className="w-72 max-w-full" />
        </div>

        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune intervention" hint="Créez une intervention pour planifier une visite." />
        ) : (
          <Table>
            <THead>
              <TH>Site</TH>
              <TH>Technicien</TH>
              <TH>Contact</TH>
              <TH>Date de visite</TH>
              <TH>Type</TH>
              <TH>Statut</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {rows.map((i) => {
                const siteNom = i.site?.nom ?? getSiteNom(i.siteId);
                const tech    = i.technicien ?? getTech(i.technicienId);
                const techNom = tech ? `${tech.prenom} ${tech.nom}` : `Technicien #${i.technicienId}`;
                return (
                  <TR key={i.id}>
                    <TD>
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                        <MapPin className="size-3.5 text-brand-500 shrink-0" />
                        {siteNom}
                      </span>
                    </TD>
                    <TD className="text-muted">{techNom}</TD>
                    <TD className="tabular text-muted">
                      {tech?.telephone && (
                        <a href={`tel:${tech.telephone}`} className="inline-flex items-center gap-1 hover:text-ink">
                          <Phone className="size-3.5" />{tech.telephone}
                        </a>
                      )}
                    </TD>
                    <TD className="tabular">{formatDateShort(i.timestampDebut)}</TD>
                    <TD className="text-muted text-sm">{INTERVENTION_TYPE_LABEL[i.typeAction]}</TD>
                    <TD>
                      <Badge tone={INTERVENTION_TONE[i.statut]} dot>
                        {INTERVENTION_STATUT_LABEL[i.statut]}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil /></Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                          onClick={() => handleDelete(i.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Modal Modifier intervention */}
      <Modal open={!!editItem} onClose={closeEdit} title="Modifier l'intervention" className="max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
          <div>
            <Label>Statut</Label>
            <Select className="w-full" value={editStatut} onChange={(e) => setEditStatut(e.target.value as InterventionStatut)}>
              {ALL_STATUTS.map((s) => (
                <option key={s} value={s}>{INTERVENTION_STATUT_LABEL[s]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Type d'action</Label>
            <Select className="w-full" value={editAction} onChange={(e) => setEditAction(e.target.value as InterventionTypeAction)}>
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>{INTERVENTION_TYPE_LABEL[a]}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? "Modification…" : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle intervention" className="max-w-xl">
        <form className="flex flex-col gap-4" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Site</Label>
              <Select className="w-full" value={siteId} onChange={(e) => setSiteId(e.target.value)} required>
                <option value="">— Choisir un site —</option>
                {(sites ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Technicien</Label>
              <Select className="w-full" value={techId} onChange={(e) => setTechId(e.target.value)} required>
                <option value="">— Choisir —</option>
                {(techniciens ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Date & heure de début</Label>
              <Input type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required />
            </div>
            <div>
              <Label>Type d'action</Label>
              <Select className="w-full" value={action} onChange={(e) => setAction(e.target.value as InterventionTypeAction)}>
                {ALL_ACTIONS.map((a) => (
                  <option key={a} value={a}>{INTERVENTION_TYPE_LABEL[a]}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Création…" : "Planifier"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
