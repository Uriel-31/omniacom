"use client";

import { useState, useCallback } from "react";
import { FileDown, Upload, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Loader } from "@/components/app/brand/Logo";
import { useAsync } from "@/hooks/use-async";
import { api } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import { CHANTIER_STATUS_LABEL } from "@/lib/constants";
import type { Chantier, EtapeChantier } from "@/types";

const MILESTONE_CODES = ["SURVEY", "APD", "MOBILIZATION", "IMPLANTATION", "EXCAVATION", "FINAL_RFI"];

function etapeByCode(etapes: EtapeChantier[] | undefined, code: string) {
  return etapes?.find((e) => e.codeEtape === code);
}

export default function SuiviQuotidienPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useAsync(() => api.dailyProgress(), [refreshKey]);
  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  async function handleExport() {
    try {
      await api.exportDailyTracker();
      toast.success("Export Excel téléchargé.");
    } catch {
      toast.error("Erreur lors de l'export.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.importDailyTracker(file);
      toast.success(`${result.imported} chantier(s) importé(s).`);
      refetch();
    } catch {
      toast.error("Erreur lors de l'import.");
    }
    e.target.value = "";
  }

  async function saveEtapeDate(etapeId: number, field: "datePlanifiee" | "dateReelle", value: string) {
    try {
      await api.updateEtapeChantier(etapeId, { [field]: value || undefined });
      refetch();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  }

  if (loading) return <Loader label="Chargement du suivi quotidien…" />;

  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title="Suivi quotidien CW"
        subtitle="Daily Reporting Tracker — jalons planifiés vs réels."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:bg-canvas">
              <Upload className="size-4" /> Import Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <Button variant="outline" onClick={handleExport}><FileDown /> Export Excel</Button>
          </>
        }
      />

      <Card>
        <CardHeader title="Tracker civil work" icon={<Building2 />} />
        <div className="overflow-x-auto border-t border-line">
          <table className="min-w-[1200px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">GO</th>
                {MILESTONE_CODES.map((c) => (
                  <th key={c} className="px-3 py-2 whitespace-nowrap">{c.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c: Chantier) => (
                <tr key={c.id} className="border-b border-line hover:bg-canvas/50">
                  <td className="px-3 py-2 font-medium text-ink">{c.nomSite}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{c.codeSite}</td>
                  <td className="px-3 py-2 text-muted">{CHANTIER_STATUS_LABEL[c.status]}</td>
                  <td className="px-3 py-2 tabular text-muted">{formatDateShort(c.dateGo)}</td>
                  {MILESTONE_CODES.map((code) => {
                    const e = etapeByCode(c.etapesChantier, code);
                    if (!e || e.status === "NON_APPLICABLE") {
                      return <td key={code} className="px-3 py-2 text-center text-faint">N/A</td>;
                    }
                    return (
                      <td key={code} className="px-2 py-2">
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            className="h-7 rounded border border-line bg-surface px-1 text-xs"
                            value={e.datePlanifiee?.slice(0, 10) ?? ""}
                            onChange={(ev) => saveEtapeDate(e.id, "datePlanifiee", ev.target.value)}
                          />
                          <input
                            type="date"
                            className="h-7 rounded border border-line bg-surface px-1 text-xs"
                            value={e.dateReelle?.slice(0, 10) ?? ""}
                            onChange={(ev) => saveEtapeDate(e.id, "dateReelle", ev.target.value)}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
