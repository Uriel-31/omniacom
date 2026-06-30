"use client";

import { useMemo, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, FileDown, History, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import type { VerificationEpi, VerificationEPIStatut } from "@/types";

const EMPTY_FORM = { techId: "", derniere: "", demande: "", delai: "", envoi: "", prochaine: "" };

function calcJours(delai: string, envoi: string): number | null {
  if (!delai || !envoi) return null;
  return Math.round((new Date(envoi).getTime() - new Date(delai).getTime()) / 86_400_000);
}

export default function VerificationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading }           = useAsync(() => api.verifications(), [refreshKey]);
  const { data: techniciens }       = useAsync(() => api.techniciens(), []);

  const [dateVerif, setDateVerif] = useState(() => new Date().toISOString().slice(0, 10));
  const [q, setQ]               = useState("");
  const [open, setOpen]         = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [histTech, setHistTech] = useState<VerificationEpi | null>(null);
  const [histMois, setHistMois] = useState("");
  const [histAnnee, setHistAnnee] = useState("");
  const [editItem, setEditItem] = useState<VerificationEpi | null>(null);
  const [busy, setBusy]         = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const joursPreview = calcJours(form.delai, form.envoi);

  const rows = useMemo(() => {
    let r = data ?? [];
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((v) => {
        const full = v.technicien
          ? `${v.technicien.nom} ${v.technicien.prenom}`.toLowerCase()
          : "";
        return full.includes(ql);
      });
    }
    return r;
  }, [data, q]);

  const histRows = useMemo(() => {
    if (!histTech) return [];
    let r = (data ?? []).filter((v) => v.technicienId === histTech.technicienId);
    if (histMois)  r = r.filter((v) => new Date(v.dateDemande).getMonth() + 1 === Number(histMois));
    if (histAnnee) r = r.filter((v) => new Date(v.dateDemande).getFullYear() === Number(histAnnee));
    return r;
  }, [data, histTech, histMois, histAnnee]);

  function setF(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setOpen(true); }

  function openEdit(v: VerificationEpi) {
    setEditItem(v);
    setForm({
      techId:    String(v.technicienId),
      derniere:  v.dateDerniereVerif?.slice(0, 10) ?? "",
      demande:   v.dateDemande.slice(0, 10),
      delai:     v.dateDelaiVerification?.slice(0, 10) ?? "",
      envoi:     v.dateEnvoie?.slice(0, 10) ?? "",
      prochaine: v.prochaineDate?.slice(0, 10) ?? "",
    });
    setOpen(true);
  }

  function openHistory(v: VerificationEpi) {
    setHistTech(v);
    setHistMois("");
    setHistAnnee("");
    setHistOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY_FORM); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const jours = calcJours(form.delai, form.envoi) ?? 0;
      const statut: VerificationEPIStatut = jours > 0 ? "EN_RETARD" : "CONFORME";
      const payload = {
        technicienId:           Number(form.techId),
        dateDerniereVerif:      form.derniere || null,
        dateDemande:            form.demande,
        dateDelaiVerification:  form.delai || null,
        dateEnvoie:             form.envoi || null,
        joursRetard:            jours,
        prochaineDate:          form.prochaine || null,
        statut,
      };
      if (editItem) {
        await api.updateVerification(editItem.id, payload);
        toast.success("Vérification mise à jour.");
      } else {
        await api.createVerification(payload);
        toast.success("Vérification enregistrée.");
      }
      refetch();
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
      refetch();
      toast.success("Vérification supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  async function handleExcelExport() {
    const { exportEpiExcel } = await import("@/lib/export");
    exportEpiExcel(
      rows.map((v) => ({
        nom:               v.technicien?.nom ?? `#${v.technicienId}`,
        prenom:            v.technicien?.prenom ?? "",
        dateDerniereVerif: formatDateShort(v.dateDerniereVerif),
        dateDemande:       formatDateShort(v.dateDemande),
        dateEnvoie:        formatDateShort(v.dateEnvoie),
        dateDelaiVerif:    formatDateShort(v.dateDelaiVerification),
        joursRetard:       calcJours(v.dateDelaiVerification ?? "", v.dateEnvoie ?? "") ?? "—",
        prochaineDate:     formatDateShort(v.prochaineDate),
      })),
      "tracker-suivi-evidences-epi",
      dateVerif,
    );
  }

  return (
    <>
      <PageHeader
        title="Suivi des évidences EPI"
        subtitle="Tracker de vérification des justificatifs EPI par technicien."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Export Excel</Button>
            <Button onClick={openCreate}><Plus /> Nouvelle vérification</Button>
          </>
        }
      />

      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4">
        <CalendarCheck className="size-5 text-danger shrink-0" />
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-ink">Date de vérification du jour</span>
          <input
            type="date"
            value={dateVerif}
            onChange={(e) => setDateVerif(e.target.value)}
            className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-danger/30"
          />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher par nom…" className="w-72 max-w-full" />
        </div>

        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune vérification" hint="Ajoutez une vérification pour commencer le suivi." />
        ) : (
          <Table>
            <THead>
              <TH>Noms</TH>
              <TH>Prénoms</TH>
              <TH>Date dernière vérif.</TH>
              <TH>Date de demande</TH>
              <TH>Date délai de vérif.</TH>
              <TH>Date d'envoi</TH>
              <TH>Jours de retard</TH>
              <TH>Date prochaine vérif.</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {rows.map((v) => {
                const jr = calcJours(v.dateDelaiVerification ?? "", v.dateEnvoie ?? "");
                return (
                  <TR key={v.id}>
                    <TD className="font-semibold text-ink">{v.technicien?.nom ?? `#${v.technicienId}`}</TD>
                    <TD>{v.technicien?.prenom ?? ""}</TD>
                    <TD className="tabular text-muted">{formatDateShort(v.dateDerniereVerif ?? undefined)}</TD>
                    <TD className="tabular text-muted">{formatDateShort(v.dateDemande)}</TD>
                    <TD className="tabular text-muted">{formatDateShort(v.dateDelaiVerification ?? undefined)}</TD>
                    <TD className="tabular text-muted">{formatDateShort(v.dateEnvoie ?? undefined)}</TD>
                    <TD className="tabular">
                      {jr === null ? (
                        <span className="text-faint">—</span>
                      ) : jr > 0 ? (
                        <span className="font-semibold text-warn">{jr} j</span>
                      ) : (
                        <span className="text-ok">{jr} j</span>
                      )}
                    </TD>
                    <TD className="tabular text-muted">{formatDateShort(v.prochaineDate ?? undefined)}</TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Historique" onClick={() => openHistory(v)}
                          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                          <History className="size-4" />
                        </button>
                        <button type="button" title="Modifier" onClick={() => openEdit(v)}
                          className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" title="Supprimer" onClick={() => handleDelete(v.id)}
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
        )}
      </Card>

      {/* Modal ajout / modification */}
      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier la vérification" : "Nouvelle vérification EPI"}>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <Label>Technicien</Label>
            <Select value={form.techId} onChange={(e) => setF("techId", e.target.value)} required disabled={!!editItem}>
              <option value="">— Sélectionner un technicien —</option>
              {(techniciens ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Date dernière vérification</Label>
              <Input type="date" value={form.derniere} onChange={(e) => setF("derniere", e.target.value)} />
            </div>
            <div>
              <Label>Date de demande des évidences <span className="text-danger">*</span></Label>
              <Input type="date" value={form.demande} onChange={(e) => setF("demande", e.target.value)} required />
            </div>
            <div>
              <Label>Date délai de vérification</Label>
              <Input type="date" value={form.delai} onChange={(e) => setF("delai", e.target.value)} />
            </div>
            <div>
              <Label>Date d'envoi de la ressource</Label>
              <Input type="date" value={form.envoi} onChange={(e) => setF("envoi", e.target.value)} />
            </div>
            <div>
              <Label>Jours de retard (calculé)</Label>
              <Input
                type="text"
                readOnly
                value={joursPreview === null ? "—" : `${joursPreview} jour(s)`}
                className="cursor-default bg-canvas text-muted"
              />
            </div>
          </div>

          <div>
            <Label>Date de prochaine vérification</Label>
            <Input type="date" value={form.prochaine} onChange={(e) => setF("prochaine", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal historique */}
      <Modal
        open={histOpen}
        onClose={() => setHistOpen(false)}
        title={histTech?.technicien ? `Historique — ${histTech.technicien.nom} ${histTech.technicien.prenom}` : "Historique"}
      >
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <Label>Mois</Label>
            <Select value={histMois} onChange={(e) => setHistMois(e.target.value)}>
              <option value="">Tous</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("fr-FR", { month: "long" })}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Label>Année</Label>
            <Input type="number" placeholder="ex. 2026" value={histAnnee} onChange={(e) => setHistAnnee(e.target.value)} />
          </div>
        </div>

        {histRows.length === 0 ? (
          <p className="py-6 text-center text-sm text-faint">Aucun enregistrement pour cette période.</p>
        ) : (
          <Table>
            <THead>
              <TH>Date demande</TH>
              <TH>Date envoi</TH>
              <TH>Jours retard</TH>
              <TH>Prochaine vérif.</TH>
            </THead>
            <TBody>
              {histRows.map((v) => {
                const jr = calcJours(v.dateDemande, v.dateEnvoie ?? "");
                return (
                  <TR key={v.id}>
                    <TD>{formatDateShort(v.dateDemande)}</TD>
                    <TD>{formatDateShort(v.dateEnvoie ?? undefined)}</TD>
                    <TD>{jr === null ? "—" : `${jr} j`}</TD>
                    <TD>{formatDateShort(v.prochaineDate ?? undefined)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Modal>
    </>
  );
}
