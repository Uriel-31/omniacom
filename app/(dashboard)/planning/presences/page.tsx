"use client";

import { useMemo, useState } from "react";
import { FileDown, FileText, Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Avatar } from "@/components/app/primitives/Avatar";
import { Loader } from "@/components/app/brand/Logo";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { PRESENCE_TONE, PRESENCE_STATUT_LABEL } from "@/lib/constants";
import { initiales, cn } from "@/lib/utils";
import type { PresenceStatut } from "@/types";

const STATUTS: PresenceStatut[] = ["PRESENT", "ABSENT", "EN_CONGE", "MALADIE", "DEPLACEMENT"];

export default function PresencesPage() {
  const techniciens = useAsync(() => api.techniciens(), []);
  const presences   = useAsync(() => api.presences(),   []);
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving]   = useState(false);

  const initialMarks = useMemo<Record<string, PresenceStatut>>(() => {
    const init: Record<string, PresenceStatut> = {};
    presences.data?.forEach((p) => { init[String(p.technicienId)] = p.statut; });
    return init;
  }, [presences.data]);

  const [overrides, setOverrides] = useState<Record<string, PresenceStatut>>({});
  const marks = { ...initialMarks, ...overrides };

  if (techniciens.loading || presences.loading) return <Loader label="Chargement des présences…" />;

  const techs    = techniciens.data ?? [];
  const presents = Object.values(marks).filter((s) => s === "PRESENT" || s === "DEPLACEMENT").length;
  const absents  = Object.values(marks).filter((s) => s === "ABSENT").length;

  async function handleExcelExport() {
    const { exportExcel } = await import("@/lib/export");
    exportExcel(
      techs.map((t) => ({
        "Technicien": `${t.prenom} ${t.nom}`,
        "Date":       date,
        "Statut":     PRESENCE_STATUT_LABEL[marks[String(t.id)] ?? "PRESENT"],
      })),
      `presences_${date}`,
    );
  }

  async function handlePdfExport() {
    const { exportPdf } = await import("@/lib/export");
    exportPdf(
      `Feuille de présence — ${date}`,
      ["Technicien", "Date", "Statut"],
      techs.map((t) => [
        `${t.prenom} ${t.nom}`,
        date,
        PRESENCE_STATUT_LABEL[marks[String(t.id)] ?? "PRESENT"],
      ]),
      `presences_${date}`,
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        techs.map((t) => {
          const statut = marks[String(t.id)];
          if (!statut) return null;
          return api.createPresence({ technicienId: t.id, date, statut });
        }).filter(Boolean),
      );
      toast.success("Feuille de présence enregistrée.");
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Feuille de présence"
        subtitle="Marquez la présence de chaque technicien pour la date choisie."
        actions={
          <>
            <Button variant="outline" onClick={handleExcelExport}><FileDown /> Excel</Button>
            <Button variant="outline" onClick={handlePdfExport}><FileText /> PDF</Button>
          </>
        }
      />

      <Card className="mb-5 flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-lg border border-line bg-surface px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-[var(--color-ok)]"><b className="tabular">{presents}</b> présents</span>
          <span className="text-[var(--color-danger)]"><b className="tabular">{absents}</b> absents</span>
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {techs.map((t) => {
          const key     = String(t.id);
          const current = marks[key];
          return (
            <Card key={t.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex min-w-48 items-center gap-3">
                <Avatar initials={initiales(t.prenom, t.nom)} size={38} />
                <div>
                  <p className="text-sm font-medium text-ink">{t.prenom} {t.nom}</p>
                  <p className="tabular text-xs text-muted">{t.telephone}</p>
                </div>
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                {STATUTS.map((s) => {
                  const active = current === s;
                  const tone   = PRESENCE_TONE[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setOverrides((m) => ({ ...m, [key]: s }))}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
                        active
                          ? "border-transparent text-white"
                          : "border-line bg-surface text-muted hover:bg-canvas",
                      )}
                      style={active ? { background: `var(--color-${tone})` } : undefined}
                    >
                      {PRESENCE_STATUT_LABEL[s]}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement…" : <><Save /> Enregistrer la feuille</>}
        </Button>
      </div>
    </>
  );
}
