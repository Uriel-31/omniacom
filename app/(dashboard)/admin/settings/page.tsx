"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Input, Label } from "@/components/app/primitives/Input";

export default function SettingsPage() {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    appName:       "OMNIACOM",
    sessionDuree:  "8",
    elementsPage:  "20",
    emailSupport:  "support@omniacom.cm",
    emailNoreply:  "noreply@omniacom.cm",
  });

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    toast.success("Paramètres enregistrés.");
  }

  return (
    <>
      <PageHeader
        title="Paramètres de l'application"
        subtitle="Configuration générale de la plateforme OMNIACOM."
      />

      <form className="flex flex-col gap-6" onSubmit={handleSave}>

        {/* Général */}
        <Card>
          <CardHeader title="Général" icon={<Settings />} />
          <div className="border-t border-line px-5 py-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Nom de l'application</Label>
              <Input value={form.appName} onChange={(e) => set("appName", e.target.value)} placeholder="OMNIACOM" />
            </div>
            <div>
              <Label>Durée de session (heures)</Label>
              <Input
                type="number" min={1} max={72}
                value={form.sessionDuree}
                onChange={(e) => set("sessionDuree", e.target.value)}
                placeholder="8"
              />
              <p className="mt-1 text-xs text-muted">L'utilisateur sera déconnecté après ce délai d'inactivité.</p>
            </div>
            <div>
              <Label>Éléments par page (tableau)</Label>
              <Input
                type="number" min={5} max={100} step={5}
                value={form.elementsPage}
                onChange={(e) => set("elementsPage", e.target.value)}
                placeholder="20"
              />
            </div>
          </div>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader title="Configuration e-mail" />
          <div className="border-t border-line px-5 py-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label>E-mail support</Label>
              <Input
                type="email"
                value={form.emailSupport}
                onChange={(e) => set("emailSupport", e.target.value)}
                placeholder="support@omniacom.cm"
              />
            </div>
            <div>
              <Label>E-mail no-reply (expéditeur)</Label>
              <Input
                type="email"
                value={form.emailNoreply}
                onChange={(e) => set("emailNoreply", e.target.value)}
                placeholder="noreply@omniacom.cm"
              />
            </div>
          </div>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader title="Logo de l'application" />
          <div className="border-t border-line px-5 py-5">
            <div className="flex items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-.png" alt="Logo actuel" className="h-14 w-14 object-contain rounded-lg border border-line bg-canvas p-1" />
              <div>
                <p className="text-sm font-medium text-ink">Logo actuel</p>
                <p className="text-xs text-muted mt-0.5">Placez le nouveau fichier dans <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[11px]">public/logo-.png</code> et redémarrez le serveur.</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? "Enregistrement…" : <><Save /> Enregistrer les paramètres</>}
          </Button>
        </div>
      </form>
    </>
  );
}
