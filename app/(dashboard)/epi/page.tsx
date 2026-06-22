"use client";

import { ShieldCheck, ShieldAlert, ShieldX, HardHat, CalendarCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/primitives/misc";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Badge } from "@/components/app/primitives/Badge";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { EPI_TONE, EPI_STATUT_LABEL } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";

export default function EpiDashboard() {
  const { data: equipements,   loading: le } = useAsync(() => api.equipements(), []);
  const { data: verifications, loading: lv } = useAsync(() => api.verifications(), []);

  if (le || lv) return <Loader label="Chargement du tableau de bord EPI…" />;

  const eq   = equipements ?? [];
  const vers = verifications ?? [];

  const mois      = new Date().getMonth();
  const annee     = new Date().getFullYear();
  const duMois    = vers.filter((v) => {
    const d = new Date(v.dateDerniereVerif);
    return d.getMonth() === mois && d.getFullYear() === annee;
  }).length;

  const conformes  = vers.filter((v) => v.statut === "CONFORME").length;
  const enRetard   = vers.filter((v) => v.statut === "EN_RETARD").length;
  const defectueux = vers.filter((v) => v.statut === "DEFECTUEUX").length;

  const alertes = vers.filter((v) => v.statut === "EN_RETARD" || v.statut === "DEFECTUEUX");

  return (
    <>
      <PageHeader
        title="Tableau de bord EPI"
        subtitle="Vue d'ensemble des équipements de protection individuelle."
      />

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Équipements</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
        <StatCard label="Total équipements"     value={eq.length}   icon={<HardHat />}       tone="var(--color-brand-500)" />
        <StatCard label="Vérifications ce mois" value={duMois}      icon={<CalendarCheck />} tone="var(--color-info)" />
        <StatCard label="Total vérifications"   value={vers.length} icon={<ShieldCheck />}   tone="var(--color-rest)" />
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Statut des vérifications</p>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard label="Conformes"  value={conformes}  icon={<ShieldCheck />} tone="var(--color-ok)" />
        <StatCard label="En retard"  value={enRetard}   icon={<ShieldAlert />} tone="var(--color-warn)" />
        <StatCard label="Défectueux" value={defectueux} icon={<ShieldX />}     tone="var(--color-danger)" />
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
            Alertes actives ({alertes.length})
          </p>
          <Card>
            <CardHeader title="Techniciens nécessitant une action" icon={<AlertTriangle className="text-[var(--color-warn)]" />} />
            <div className="border-t border-line">
              <Table>
                <THead>
                  <TH>Technicien</TH>
                  <TH>Dernière vérif.</TH>
                  <TH>Jours de retard</TH>
                  <TH>Prochaine vérif.</TH>
                  <TH>Statut</TH>
                </THead>
                <TBody>
                  {alertes.map((v) => {
                    const nom = v.technicien
                      ? `${v.technicien.prenom} ${v.technicien.nom}`
                      : `Technicien #${v.technicienId}`;
                    return (
                      <TR key={v.id}>
                        <TD className="font-semibold text-ink">{nom}</TD>
                        <TD className="tabular text-muted">{formatDateShort(v.dateDerniereVerif)}</TD>
                        <TD className="tabular">
                          <span className="font-semibold text-[var(--color-warn)]">{v.joursRetard} j</span>
                        </TD>
                        <TD className="tabular text-muted">{formatDateShort(v.prochaineDate)}</TD>
                        <TD>
                          <Badge tone={EPI_TONE[v.statut]} dot>
                            {EPI_STATUT_LABEL[v.statut]}
                          </Badge>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </div>
            <div className="border-t border-line px-5 py-3">
              <Link href="/epi/verifications" className="text-sm font-medium text-brand-500 hover:underline">
                Gérer toutes les vérifications →
              </Link>
            </div>
          </Card>
        </>
      )}

      {alertes.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-ok)] bg-[var(--color-ok)]/5 px-5 py-4">
          <ShieldCheck className="size-5 text-[var(--color-ok)]" />
          <p className="text-sm font-medium text-[var(--color-ok)]">Tous les techniciens sont à jour — aucune alerte active.</p>
        </div>
      )}
    </>
  );
}
