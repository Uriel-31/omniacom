"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, MapPin, History, Pencil, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { INTERVENTION_TONE, INTERVENTION_STATUT_LABEL, INTERVENTION_TYPE_LABEL } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { Site } from "@/types";

const EMPTY = { nom: "", localisation: "", region: "" };

export default function SitesPage() {
  const { data, loading }           = useAsync(() => api.sites(), []);
  const { data: interventions }     = useAsync(() => api.interventions(), []);
  const [items, setItems]           = useState<Site[]>([]);
  const [q, setQ]                   = useState("");
  const [open, setOpen]             = useState(false);
  const [editItem, setEditItem]     = useState<Site | null>(null);
  const [histoSite, setHistoSite]   = useState<Site | null>(null);
  const [busy, setBusy]             = useState(false);
  const [form, setForm]             = useState(EMPTY);

  useEffect(() => { if (data) setItems(data); }, [data]);

  const filtered = useMemo(
    () => items.filter((s) =>
      `${s.nom} ${s.region} ${s.localisation}`.toLowerCase().includes(q.toLowerCase()),
    ),
    [items, q],
  );

  const histoInterventions = useMemo(
    () => (interventions ?? []).filter((i) => i.siteId === histoSite?.id),
    [interventions, histoSite],
  );

  function setF(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  function openCreate() { setEditItem(null); setForm(EMPTY); setOpen(true); }

  function openEdit(s: Site) {
    setEditItem(s);
    setForm({ nom: s.nom, localisation: s.localisation, region: s.region });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editItem) {
        const updated = await api.updateSite(editItem.id, form);
        setItems((prev) => prev.map((s) => s.id === editItem.id ? { ...s, ...updated } : s));
        toast.success("Site mis à jour.");
      } else {
        const created = await api.createSite(form);
        setItems((prev) => [...prev, created]);
        toast.success("Site ajouté.");
      }
      closeModal();
    } catch {
      toast.error(editItem ? "Erreur lors de la modification." : "Erreur lors de l'ajout du site.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer le site « ${name} » ?`)) return;
    try {
      await api.deleteSite(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Site « ${name} » supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Sites d'intervention"
        subtitle="Répertoire des sites et historique des interventions."
        actions={<Button onClick={openCreate}><Plus /> Ajouter un site</Button>}
      />

      <div className="mb-5">
        <SearchInput value={q} onChange={setQ} placeholder="Rechercher un site (nom, région, localisation)…" className="w-80 max-w-full" />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="Aucun site" hint="Ajoutez votre premier site pour commencer." /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const nbInterventions = (interventions ?? []).filter((i) => i.siteId === s.id).length;
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-500">
                    <MapPin className="size-5" />
                  </span>
                  <span className="rounded-md bg-canvas px-2 py-1 text-xs font-medium text-muted">{s.region}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{s.nom}</h3>
                <p className="mt-0.5 text-sm text-muted">{s.localisation}</p>
                <p className="mt-1 text-xs text-faint">
                  <CalendarDays className="inline size-3 mr-1" />
                  {nbInterventions} intervention(s)
                </p>
                <div className="mt-4 flex gap-1.5 border-t border-line-soft pt-3">
                  <Button variant="ghost" size="sm" onClick={() => setHistoSite(s)}>
                    <History /> Historique
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil /></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                    onClick={() => handleDelete(s.id, s.nom)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Ajouter / Modifier */}
      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le site" : "Ajouter un site"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label>Nom du site</Label>
            <Input value={form.nom} onChange={(e) => setF("nom", e.target.value)} placeholder="Site Douala-Centre" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Région</Label>
              <Input value={form.region} onChange={(e) => setF("region", e.target.value)} placeholder="Littoral" required />
            </div>
            <div>
              <Label>Localisation</Label>
              <Input value={form.localisation} onChange={(e) => setF("localisation", e.target.value)} placeholder="Douala, Bonabéri" required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy ? (editItem ? "Modification…" : "Ajout…") : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Historique du site */}
      <Modal
        open={!!histoSite}
        onClose={() => setHistoSite(null)}
        title={`Historique — ${histoSite?.nom ?? ""}`}
        className="max-w-2xl"
      >
        {histoInterventions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Aucune intervention enregistrée pour ce site.</p>
        ) : (
          <Table>
            <THead>
              <TH>Date</TH>
              <TH>Type</TH>
              <TH>Statut</TH>
            </THead>
            <TBody>
              {histoInterventions.map((i) => (
                <TR key={i.id}>
                  <TD className="tabular text-muted">{formatDateShort(i.timestampDebut)}</TD>
                  <TD className="text-muted">{INTERVENTION_TYPE_LABEL[i.typeAction]}</TD>
                  <TD>
                    <Badge tone={INTERVENTION_TONE[i.statut]} dot>
                      {INTERVENTION_STATUT_LABEL[i.statut]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setHistoSite(null)}>Fermer</Button>
        </div>
      </Modal>
    </>
  );
}
