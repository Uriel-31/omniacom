"use client";

import { Users, UserCheck, UserX, Phone, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/primitives/misc";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Button } from "@/components/app/primitives/Button";
import { Badge } from "@/components/app/primitives/Badge";
import { Avatar } from "@/components/app/primitives/Avatar";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { PresenceChart } from "@/components/app/charts/PresenceChart";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { PRESENCE_TONE, PRESENCE_STATUT_LABEL } from "@/lib/constants";
import { initiales, formatDate } from "@/lib/utils";
import { MOCK_PRESENCE_SERIE } from "@/lib/mock-data";
import type { PresenceStatut } from "@/types";

export default function PlanningDashboard() {
  const presences   = useAsync(() => api.presences(), []);
  const techniciens = useAsync(() => api.techniciens(), []);

  if (presences.loading || techniciens.loading) {
    return <Loader label="Chargement du tableau de bord…" />;
  }

  const today    = presences.data ?? [];
  const techs    = techniciens.data ?? [];
  const total    = techs.length;
  const presents = today.filter((p) => p.statut === "PRESENT" || p.statut === "DEPLACEMENT").length;
  const absents  = today.filter((p) => p.statut === "ABSENT").length;
  const tauxPresence = total ? (presents / total) * 100 : 0;

  const absentsList = today.filter((p) =>
    (["ABSENT", "MALADIE", "EN_CONGE"] as PresenceStatut[]).includes(p.statut),
  );

  function getTechNom(id: number) {
    const t = techs.find((x) => x.id === id);
    return t ? { prenom: t.prenom, nom: t.nom, tel: t.telephone } : null;
  }

  return (
    <>
      <PageHeader
        title="Planning & Présences"
        subtitle={`Vue du jour — ${formatDate(new Date().toISOString())}`}
        actions={
          <Button size="md">
            <Plus /> Nouvelle intervention
          </Button>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total techniciens"    value={total}    icon={<Users />}     tone="var(--color-rest)" />
        <StatCard label="Présents aujourd'hui" value={presents} percent={tauxPresence} tone="var(--color-ok)" />
        <StatCard label="Absents"              value={absents}  icon={<UserX />}     tone="var(--color-danger)" />
        <StatCard label="Taux de présence"     value={`${Math.round(tauxPresence)}%`} icon={<UserCheck />} tone="var(--color-brand-500)" />
      </div>

      {/* Graphique + absents */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Évolution des présences (7 derniers jours)" icon={<UserCheck />} />
          <div className="px-5 pb-5">
            <PresenceChart data={MOCK_PRESENCE_SERIE} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Absents du jour" icon={<UserX />} />
          <div className="px-2 pb-3">
            {absentsList.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-faint">
                Aucun absent aujourd&apos;hui 🎉
              </p>
            ) : (
              absentsList.map((p) => {
                const info = getTechNom(p.technicienId);
                const nom  = info ? `${info.prenom} ${info.nom}` : `#${p.technicienId}`;
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-canvas">
                    <Avatar initials={initiales(info?.prenom ?? "", info?.nom ?? "")} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{nom}</p>
                      <p className="text-xs text-muted">{PRESENCE_STATUT_LABEL[p.statut]}</p>
                    </div>
                    <Badge tone={PRESENCE_TONE[p.statut]} dot>
                      {PRESENCE_STATUT_LABEL[p.statut]}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Feuille de présence du jour */}
      <Card className="mt-6">
        <CardHeader
          title={`Feuille de présence — ${formatDate(new Date().toISOString())}`}
          action={
            <span className="text-sm text-muted">
              {presents} présents · {absents} absents
            </span>
          }
        />
        <div className="border-t border-line">
          <Table>
            <THead>
              <TH>Technicien</TH>
              <TH>Statut</TH>
              <TH>Date</TH>
              <TH className="text-right">Contact</TH>
            </THead>
            <TBody>
              {today.map((p) => {
                const info = getTechNom(p.technicienId);
                const nom  = info ? `${info.prenom} ${info.nom}` : `Technicien #${p.technicienId}`;
                return (
                  <TR key={p.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initiales(info?.prenom ?? "", info?.nom ?? "")} size={32} />
                        <span className="font-semibold text-ink">{nom}</span>
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={PRESENCE_TONE[p.statut]} dot>
                        {PRESENCE_STATUT_LABEL[p.statut]}
                      </Badge>
                    </TD>
                    <TD className="tabular text-muted">{p.date}</TD>
                    <TD className="text-right">
                      {info?.tel && (
                        <a href={`tel:${info.tel}`}>
                          <Button variant="ghost" size="sm"><Phone /></Button>
                        </a>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
