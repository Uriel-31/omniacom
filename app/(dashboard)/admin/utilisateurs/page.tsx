"use client";

import { useState, useMemo } from "react";
import { UserPlus, Plus, Pencil, Trash2, ShieldAlert, FileDown } from "lucide-react";
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
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { ROLE_LABEL, ROLE_TONE } from "@/lib/constants";
import { initiales, relativeTime } from "@/lib/utils";
import type { Role, User } from "@/types";

const EMPTY_FORM = { nom: "", prenom: "", email: "", role: "GESTIONNAIRE_PLANNING" as Role, mdp: "" };
const ROLES = Object.keys(ROLE_LABEL) as Role[];

export default function UtilisateursPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error } = useAsync(() => api.users(), [refreshKey]);
  const [open, setOpen]     = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [busy, setBusy]     = useState(false);
  const [q, setQ]           = useState("");
  const [form, setForm]     = useState(EMPTY_FORM);

  const rows = useMemo(
    () => (data ?? []).filter((u) =>
      `${u.nom} ${u.prenom ?? ""} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
    ),
    [data, q],
  );

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  function openCreate() {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ nom: u.nom, prenom: u.prenom ?? "", email: u.email, role: u.role, mdp: "" });
    setOpen(true);
  }

  function closeModal() { setOpen(false); setEditUser(null); setForm(EMPTY_FORM); }

  function refetch() { setRefreshKey((k) => k + 1); }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editUser) {
        await api.updateUser(editUser.id, {
          nom: form.nom, prenom: form.prenom || undefined, email: form.email, role: form.role,
        });
        toast.success("Utilisateur mis à jour.");
      } else {
        await api.createUser({
          nom: form.nom, email: form.email, role: form.role, motDePasse: form.mdp,
        });
        toast.success("Utilisateur créé avec succès.");
      }
      refetch();
      closeModal();
    } catch {
      toast.error(editUser ? "Erreur lors de la modification." : "Erreur lors de la création.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      await api.deleteUser(id);
      refetch();
      toast.success(`${name} supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  }

  return (
    <>
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Comptes utilisateurs, rôles et accès à la plateforme."
        actions={
          <>
            <Button variant="outline" onClick={() => api.exportUtilisateursExcel().then(() => toast.success("Export téléchargé.")).catch(() => toast.error("Erreur export."))}>
              <FileDown /> Excel
            </Button>
            <Button onClick={openCreate}><UserPlus /> Créer un utilisateur</Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Comptes utilisateurs"
          icon={<ShieldAlert />}
          action={<SearchInput value={q} onChange={setQ} placeholder="Nom, email…" className="w-56" />}
        />
        <div className="border-t border-line">
          {loading ? (
            <Loader />
          ) : error ? (
            <p className="px-5 py-8 text-center text-sm text-danger">{error}</p>
          ) : rows.length === 0 ? (
            <EmptyState title="Aucun utilisateur" hint="Cliquez sur « Créer un utilisateur » pour commencer." />
          ) : (
            <Table>
              <THead>
                <TH>Utilisateur</TH>
                <TH>Rôle</TH>
                <TH>Dernière activité</TH>
                <TH className="text-right">Actions</TH>
              </THead>
              <TBody>
                {rows.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initiales(u.nom)} photoUrl={u.photoUrl} size={34} />
                        <div>
                          <p className="font-semibold text-ink">{u.prenom ? `${u.prenom} ${u.nom}` : u.nom}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                    </TD>
                    <TD className="text-muted">{relativeTime(u.updatedAt)}</TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Modifier" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-canvas hover:text-ink" onClick={() => openEdit(u)}>
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" title="Supprimer" className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(u.id, u.nom)}>
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

      <Modal open={open} onClose={closeModal} title={editUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prénom</Label>
              <Input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Jean" />
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Dupont" required />
            </div>
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="j.dupont@omniacom.cm" required />
          </div>
          <div>
            <Label>Rôle</Label>
            <Select className="w-full" value={form.role} onChange={(e) => set("role", e.target.value)} required>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </Select>
          </div>
          {!editUser && (
            <div>
              <Label>Mot de passe provisoire</Label>
              <Input type="password" value={form.mdp} onChange={(e) => set("mdp", e.target.value)} placeholder="Min. 8 caractères" required minLength={8} />
            </div>
          )}
          {editUser && (
            <div>
              <Label>Photo de profil</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !editUser) return;
                  try {
                    await api.uploadUserPhoto(editUser.id, file);
                    toast.success("Photo mise à jour.");
                    refetch();
                  } catch {
                    toast.error("Erreur lors de l'upload.");
                  }
                }}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy ? (editUser ? "Modification…" : "Création…") : editUser ? <><Pencil className="size-4" /> Enregistrer</> : <><Plus /> Créer le compte</>}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
