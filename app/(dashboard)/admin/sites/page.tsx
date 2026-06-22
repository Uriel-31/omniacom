"use client";

import { useMemo, useState } from "react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";

export default function AdminSitesPage() {
  const { data, loading } = useAsync(() => api.sites(), []);
  const [q, setQ]         = useState("");
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [nom, setNom]           = useState("");
  const [localisation, setLoc]  = useState("");
  const [region, setRegion]     = useState("");

  const filtered = useMemo(
    () => (data ?? []).filter((s) =>
      `${s.nom} ${s.region} ${s.localisation}`.toLowerCase().includes(q.toLowerCase()),
    ),
    [data, q],
  );

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createSite({ nom, localisation, region });
      toast.success("Site créé.");
      setOpen(false);
      setNom(""); setLoc(""); setRegion("");
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer le site « ${name} » ?`)) return;
    try {
      await api.deleteSite(id);
      toast.success(`Site « ${name} » supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Sites d'intervention"
        subtitle="Référentiel global des sites (vue administrateur)."
        actions={<Button onClick={() => setOpen(true)}><Plus /> Ajouter</Button>}
      />
      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher un site…" className="w-72 max-w-full" />
          <span className="text-sm text-muted">{filtered.length} site(s)</span>
        </div>
        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState title="Aucun site" hint="Aucun site ne correspond à la recherche." />
        ) : (
          <Table>
            <THead>
              <TH>Nom</TH>
              <TH>Région</TH>
              <TH>Localisation</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((s) => (
                <TR key={s.id}>
                  <TD className="font-medium text-ink">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4 text-brand-500 shrink-0" />
                      {s.nom}
                    </span>
                  </TD>
                  <TD className="text-muted">{s.region}</TD>
                  <TD className="text-muted">{s.localisation}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm"><Pencil /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                        onClick={() => handleDelete(s.id, s.nom)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un site">
        <form className="flex flex-col gap-4" onSubmit={handleCreate}>
          <div>
            <Label>Nom du site</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Site Yaoundé-Nord" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Région</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Centre" required />
            </div>
            <div>
              <Label>Localisation</Label>
              <Input value={localisation} onChange={(e) => setLoc(e.target.value)} placeholder="Yaoundé, Mfandena" required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy ? "Création…" : "Créer le site"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
