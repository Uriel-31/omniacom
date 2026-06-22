"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Phone, Trash2, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Avatar } from "@/components/app/primitives/Avatar";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { TECHNICIEN_TONE, TECHNICIEN_STATUS_LABEL } from "@/lib/constants";
import { initiales } from "@/lib/utils";
import type { Technicien, TechnicienStatus } from "@/types";

const EMPTY = { nom: "", prenom: "", tel: "", status: "ACTIF" as TechnicienStatus };

export default function TechniciensPage() {
  const { data, loading, error } = useAsync(() => api.techniciens(), []);
  const [items, setItems]       = useState<Technicien[]>([]);
  const [q, setQ]               = useState("");
  const [open, setOpen]         = useState(false);
  const [editItem, setEditItem] = useState<Technicien | null>(null);
  const [busy, setBusy]         = useState(false);
  const [form, setForm]         = useState(EMPTY);

  useEffect(() => { if (data) setItems(data); }, [data]);

  const filtered = useMemo(
    () => items.filter((t) => `${t.prenom} ${t.nom}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const actifs   = items.filter((t) => t.status === "ACTIF").length;
  const inactifs = items.length - actifs;

  function setF(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  function openCreate() { setEditItem(null); setForm(EMPTY); setOpen(true); }

  function openEdit(t: Technicien) {
    setEditItem(t);
    setForm({ nom: t.nom, prenom: t.prenom, tel: t.telephone, status: t.status });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditItem(null); setForm(EMPTY); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { nom: form.nom, prenom: form.prenom, telephone: form.tel, status: form.status };
      if (editItem) {
        const updated = await api.updateTechnicien(editItem.id, payload);
        setItems((prev) => prev.map((t) => t.id === editItem.id ? { ...t, ...updated } : t));
        toast.success("Technicien mis à jour.");
      } else {
        const created = await api.createTechnicien(payload);
        setItems((prev) => [...prev, created]);
        toast.success("Technicien ajouté avec succès.");
      }
      closeModal();
    } catch {
      toast.error(editItem ? "Erreur lors de la modification." : "Erreur lors de l'ajout.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      await api.deleteTechnicien(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success(`${name} supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Techniciens"
        subtitle="Gérez l'équipe terrain : statuts, contacts et interventions."
        actions={<Button onClick={openCreate}><Plus /> Ajouter un technicien</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{items.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-ok)] bg-[var(--color-ok-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ok)]">Actifs</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-ok)]">{actifs}</p>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Inactifs</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{inactifs}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Liste des techniciens" icon={<Users />} />
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 pb-3">
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher…" className="w-72 max-w-full" />
          <span className="text-sm text-muted">{filtered.length} technicien(s)</span>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-danger)]">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucun technicien trouvé" hint="Ajoutez votre premier technicien pour commencer." />
        ) : (
          <Table>
            <THead>
              <TH>Technicien</TH>
              <TH>Téléphone</TH>
              <TH>Statut</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar initials={initiales(t.prenom, t.nom)} size={36} />
                      <div>
                        <p className="font-semibold text-ink">{t.prenom} {t.nom}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="tabular text-muted">{t.telephone}</TD>
                  <TD>
                    <Badge tone={TECHNICIEN_TONE[t.status]} dot>
                      {TECHNICIEN_STATUS_LABEL[t.status]}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <a href={`tel:${t.telephone}`}>
                        <Button variant="ghost" size="sm"><Phone /></Button>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                        onClick={() => handleDelete(t.id, `${t.prenom} ${t.nom}`)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={closeModal} title={editItem ? "Modifier le technicien" : "Ajouter un technicien"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.nom} onChange={(e) => setF("nom", e.target.value)} placeholder="Benali" required />
            </div>
            <div>
              <Label>Prénom</Label>
              <Input value={form.prenom} onChange={(e) => setF("prenom", e.target.value)} placeholder="Yassine" required />
            </div>
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={form.tel} onChange={(e) => setF("tel", e.target.value)} placeholder="+237 6XX XX XX XX" required />
          </div>
          {editItem && (
            <div>
              <Label>Statut</Label>
              <Select className="w-full" value={form.status} onChange={(e) => setF("status", e.target.value)}>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy ? (editItem ? "Modification…" : "Ajout…") : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
