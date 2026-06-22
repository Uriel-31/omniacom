"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, ShieldCheck, Trash2, Pencil, FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, FilterPills, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { EPI_TONE, EPI_STATUT_LABEL } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { VerificationEpi, VerificationEPIStatut } from "@/types";

const FILTRES = ["Tous", "En retard", "À jour"] as const;
const EMPTY_FORM = { techId: "", derniere: "", demande: "", envoi: "" };

export default function VerificationsPage() {
  const { data, loading } = useAsync(() => api.verifications(), []);
  const [items, setItems]       = useState<VerificationEpi[]>([]);
  const [q, setQ]               = useState("");
  const [filtre, setFiltre]     = useState<(typeof FILTRES)[number]>("Tous");
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState<VerificationEpi | null>(null);
  const [busy, setBusy]         = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  useEffect(() => { if (data) setItems(data); }, [data]);

  const rows = useMemo(() => {
    let r = items;
    if (filtre === "En retard") r = r.filter((v) => v.statut !== "CONFORME");
    if (filtre === "À jour")    r = r.filter((v) => v.statut === "CONFORME");
    if (q) {
      r = r.filter((v) => {
        const nom = v.technicien ? `${v.technicien.prenom} ${v.technicien.nom}` : `#${v.technicienId}`;
        return nom.toLowerCase().includes(q.toLowerCase());
      });
    }
    return r;
  }, [items, q, filtre]);

  function setF(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(v: VerificationEpi) {
    setEditItem(v);
    setForm({
      techId:   String(v.technicienId),
      derniere: v.dateDerniereVerif?.slice(0, 10) ?? "",
      demande:  v.dateDemande?.slice(0, 10) ?? "",
      envoi:    v.dateEnvoie?.slice(0, 10) ?? "",
    });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY_FORM); }

  function computePayload() {
    const joursRetard = form.demande && form.envoi
      ? Math.max(0, Math.round((new Date(form.envoi).getTime() - new Date(form.demande).getTime()) / 86400000))
      : 0;
    const prochaineDate = form.derniere
      ? new Date(new Date(form.derniere).getTime() + 30 * 86400000).toISOString().slice(0, 10)
      : "";
    const statut: VerificationEPIStatut = joursRetard > 0 ? "EN_RETARD" : "CONFORME";
    return { technicienId: Number(form.techId), dateDerniereVerif: form.derniere, dateDemande: form.demande, dateEnvoie: form.envoi, joursRetard, prochaineDate, statut };
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = computePayload();
      if (editItem) {
        const updated = await api.updateVerification(editItem.id, payload);
        setItems((prev) => prev.map((v) => v.id === editItem.id ? { ...v, ...updated } : v));
        toast.success("Vérification mise à jour.");
      } else {
        const created = await api.createVerification(payload);
        setItems((prev) => [...prev, created]);
        toast.success("Vérification enregistrée.");
      }
      closeModal();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette vérification ?")) return;
    try {
      await api.deleteVerification(id);
      setItems((prev) => prev.filter((v) => v.id !== id));
      toast.success("Vérification supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  async function handleExcelExport() {
    const { exportExcel } = await import("@/lib/export");
    exportExcel(
      items.map((v) => ({
        "Technicien":       v.technicien ? `${v.technicien.prenom} ${v.technicien.nom}` : `#${v.technicienId}`,
        "Dernière vérif.":  formatDateShort(v.dateDerniereVerif),
        "Date demande":     formatDateShort(v.dateDemande),
        "Date envoi":       formatDateShort(v.dateEnvoie),
        "Jours retard":     v.joursRetard,
        "Prochaine vérif.": formatDateShort(v.prochaineDate),
        "Statut":           EPI_STATUT_LABEL[v.statut],
      })),
      "verifications-epi",
    );
  }

  async function handlePdfExport() {
    const { exportPdf } = await import("@/lib/export");
    exportPdf(
      "Vérifications EPI",
      ["Technicien", "Dernière vérif.", "Date demande", "Date envoi", "Retard (j)", "Prochaine vérif.", "Statut"],
      items.map((v) => [
        v.technicien ? `${v.technicien.prenom} ${v.technicien.nom}` : `#${v.technicienId}`,
        formatDateShort(v.dateDerniereVerif),
        formatDateShort(v.dateDemande),
        formatDateShort(v.dateEnvoie),
        v.joursRetard,
        formatDateShort(v.prochaineDate),
        EPI_STATUT_LABEL[v.statut],
      ]),
      "verifications-epi",
    );
  }

  return (
    <>
      <PageHeader
        title="Vérifications EPI"
        subtitle="Suivi mensuel des équipements de protection individuelle."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Excel</Button>
            <Button variant="outline" onClick={handlePdfExport}><FileText /> PDF</Button>
            <Button onClick={openCreate}><Plus /> Nouvelle vérification</Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <FilterPills options={FILTRES} value={filtre} onChange={setFiltre} />
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher un technicien…" className="w-72 max-w-full" />
        </div>

        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune vérification" hint="Ajoutez une vérification pour suivre la conformité." />
        ) : (
          <Table>
            <THead>
              <TH>Technicien</TH>
              <TH>Équipements</TH>
              <TH>Dernière vérif.</TH>
              <TH>Jours retard</TH>
              <TH>Prochaine vérif.</TH>
              <TH>Statut</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {rows.map((v) => {
                const nom = v.technicien
                  ? `${v.technicien.prenom} ${v.technicien.nom}`
                  : `Technicien #${v.technicienId}`;
                return (
                  <TR key={v.id}>
                    <TD className="font-semibold text-ink">{nom}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-1">
                        {(v.equipements ?? []).map((eq) => (
                          <span key={eq.id} className="rounded-md bg-canvas px-1.5 py-0.5 text-xs text-muted">
                            {eq.nom}
                          </span>
                        ))}
                        {(v.equipements ?? []).length === 0 && <span className="text-xs text-faint">—</span>}
                      </div>
                    </TD>
                    <TD className="tabular">{formatDateShort(v.dateDerniereVerif)}</TD>
                    <TD className="tabular">
                      {v.joursRetard > 0 ? (
                        <span className="font-semibold text-[var(--color-warn)]">{v.joursRetard} j</span>
                      ) : (
                        <span className="text-[var(--color-ok)]">0 j</span>
                      )}
                    </TD>
                    <TD className="tabular">{formatDateShort(v.prochaineDate)}</TD>
                    <TD>
                      <Badge tone={EPI_TONE[v.statut]} dot>
                        {EPI_STATUT_LABEL[v.statut]}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Modifier" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink" onClick={() => openEdit(v)}>
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(v.id)}>
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
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier la vérification" : "Nouvelle vérification EPI"}>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {!editItem && (
            <div>
              <Label>ID Technicien</Label>
              <Input type="number" value={form.techId} onChange={(e) => setF("techId", e.target.value)} placeholder="Ex. 3" required />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Dernière vérif.</Label><Input type="date" value={form.derniere} onChange={(e) => setF("derniere", e.target.value)} required /></div>
            <div><Label>Date demande</Label>  <Input type="date" value={form.demande}  onChange={(e) => setF("demande", e.target.value)}  required /></div>
            <div><Label>Date envoi</Label>    <Input type="date" value={form.envoi}    onChange={(e) => setF("envoi", e.target.value)}    required /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy
                ? (editItem ? "Modification…" : "Enregistrement…")
                : editItem
                  ? <><Pencil className="size-4" /> Enregistrer</>
                  : <><ShieldCheck className="size-4" /> Enregistrer</>
              }
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
