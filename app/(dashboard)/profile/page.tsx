"use client";

import { Camera } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Avatar } from "@/components/app/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { api, storage } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constants";
import { initiales } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  if (!user) return null;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await api.uploadUserPhoto(user.id, file);
      storage.setUser(updated);
      refreshUser(updated);
      toast.success("Photo de profil mise à jour.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    }
    e.target.value = "";
  }

  return (
    <>
      <PageHeader
        title="Mon profil"
        subtitle="Informations du compte et photo de profil."
      />

      <Card className="max-w-lg">
        <CardHeader title="Identité" icon={<Camera />} />
        <div className="border-t border-line px-5 py-5">
          <div className="mb-6 flex items-center gap-4">
            <Avatar initials={initiales(user.nom)} photoUrl={user.photoUrl} size={72} />
            <div>
              <p className="text-lg font-semibold text-ink">{user.nom}</p>
              <p className="text-sm text-muted">{user.email}</p>
              <p className="mt-1 text-xs text-faint">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft hover:bg-canvas">
            <Camera className="size-4" />
            Changer la photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
      </Card>
    </>
  );
}
