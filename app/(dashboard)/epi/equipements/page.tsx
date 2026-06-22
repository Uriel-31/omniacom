"use client";

import { useMemo, useState } from "react";
import { Plus, HardHat, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Modal } from "@/components/app/primitives/Modal";
import { Input, Label, Select } from "@/components/app/primitives/Input";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import type { EquipementStatus } from "@/types";

type ToneVariant = "ok" | "warn" | "danger" | "rest";

const STATUS_TONE: Record<EquipementStatus, ToneVariant> = {
  CONFORME:     "ok",
  EN_RETARD:    "warn",
  DEFECTUEUX:   "danger",
  HORS_SERVICE: "rest",
};

const STATUS_LABEL: Record<EquipementStatus, string> = {
  CONFORME:     "Conforme",
  EN_RETARD:    "En retard",
  DEFECTUEUX:   "Défectueux",
  HORS_SERVICE: "Hors service",
};

const ALL_STATUTS: EquipementStatus[] = ["CONFORME", "EN_RETARD", "DEFECTUEUX", "HORS_SERVICE"];

export default function EquipementsPage() {
  const { data, loading, error } = useAsync(() => api.equipements(), []);
  const [q, setQ]           = useState("");
  const [open, setOpen]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [nom, setNom]       = useState("");
  const [statut, setStatut] = useState<EquipementStatus>("CONFORME");

  const rows = useMemo(() => {
    const list = data ?? [];
    if (!q) return list;
    return list.filter((e) => e.nom.toLowerCase().includes(q.toLowerCase()));
  }, [data, q]);

  const conformes     = (data ?? []).filter((e) => e.status === "CONFORME").length;
  const nonConformes  = (data ?? []).length - conformes;

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createEquipement({ nom, status: statut });
      toast.success("Équipement ajouté.");
      setOpen(false);
      setNom(""); setStatut("CONFORME");
    } catch {
      toast.error("Erreur lors de l'ajout.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    try {
      await api.deleteEquipement(id);
      toast.success(`${name} supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Équipements EPI"
        subtitle="Inventaire et état de conformité des équipements de protection."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Ajouter un équipement
          </Button>
        }
      />

      {/* KPI rapides */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{(data ?? []).length}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-ok)] bg-[var(--color-ok-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ok)]">Conformes</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-ok)]">{conformes}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-danger)]">Non conformes</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-danger)]">{nonConformes}</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher un équipement…" className="w-72 max-w-full" />
          <span className="text-sm text-muted">{rows.length} équipement(s)</span>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-danger)]">{error}</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Aucun équipement"
            hint="Ajoutez votre premier équipement EPI pour commencer le suivi."
          />
        ) : (
          <Table>
            <THead>
              <TH>Équipement</TH>
              <TH>Statut</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {rows.map((eq) => (
                <TR key={eq.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-canvas text-faint">
                        <HardHat className="size-4" />
                      </span>
                      <span className="font-medium text-ink">{eq.nom}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[eq.status]} dot>
                      {STATUS_LABEL[eq.status]}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm"><Pencil /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                        onClick={() => handleDelete(eq.id, eq.nom)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un équipement">
        <form className="flex flex-col gap-4" onSubmit={handleCreate}>
          <div>
            <Label>Nom de l&apos;équipement</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex. Casque de protection classe E"
              required
            />
          </div>
          <div>
            <Label>Statut initial</Label>
            <Select
              className="w-full"
              value={statut}
              onChange={(e) => setStatut(e.target.value as EquipementStatus)}
            >
              {ALL_STATUTS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Ajout…" : <><HardHat /> Ajouter</>}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
