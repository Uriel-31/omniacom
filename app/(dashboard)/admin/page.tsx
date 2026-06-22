"use client";

import {
  Users, UserCog, HardHat, MapPin, CalendarDays,
  ShieldCheck, Building2, Receipt, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/app/primitives/misc";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Loader } from "@/components/app/brand/Logo";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const { data: users,       loading: lu } = useAsync(() => api.users(),         []);
  const { data: techniciens, loading: lt } = useAsync(() => api.techniciens(),   []);
  const { data: sites,       loading: ls } = useAsync(() => api.sites(),         []);
  const { data: interventions,loading:li } = useAsync(() => api.interventions(), []);
  const { data: presences,   loading: lp } = useAsync(() => api.presences(),     []);
  const { data: verifs,      loading: lv } = useAsync(() => api.verifications(), []);
  const { data: chantiers,   loading: lc } = useAsync(() => api.chantiers(),     []);
  const { data: bcs,         loading: lb } = useAsync(() => api.bonsCommande(),  []);

  if (lu || lt || ls || li || lp || lv || lc || lb)
    return <Loader label="Chargement du tableau de bord…" />;

  const u = users ?? [];
  const nbAdmin    = u.filter((x) => x.role === "ADMIN").length;
  const nbPmo      = u.filter((x) => x.role === "PMO").length;
  const nbPlanning = u.filter((x) => x.role === "GESTIONNAIRE_PLANNING").length;
  const nbEpi      = u.filter((x) => x.role === "GESTIONNAIRE_EPI").length;

  return (
    <>
      <PageHeader
        title="Tableau de bord Admin"
        subtitle="Vue d'ensemble de la plateforme OMNIACOM."
      />

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Utilisateurs & Accès</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Total utilisateurs"      value={u.length}              icon={<Users />}    tone="var(--color-brand-500)" />
        <StatCard label="Administrateurs"         value={nbAdmin}               icon={<UserCog />}  tone="var(--color-danger)" />
        <StatCard label="PMO Officers"            value={nbPmo}                 icon={<Building2 />}tone="var(--color-rest)" />
        <StatCard label="Gestionnaires Planning"  value={nbPlanning}            icon={<Users />}    tone="var(--color-info)" />
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Terrain & EPI</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Gestionnaires EPI"  value={nbEpi}                        icon={<ShieldCheck />} tone="var(--color-warn)" />
        <StatCard label="Techniciens"        value={(techniciens ?? []).length}    icon={<HardHat />}     tone="var(--color-ok)" />
        <StatCard label="Sites"              value={(sites ?? []).length}          icon={<MapPin />}      tone="var(--color-info)" />
        <StatCard label="Vérifications EPI"  value={(verifs ?? []).length}         icon={<ShieldCheck />} tone="var(--color-warn)" />
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Activité & Projets</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Interventions"      value={(interventions ?? []).length}  icon={<Activity />}    tone="var(--color-ok)" />
        <StatCard label="Présences"          value={(presences ?? []).length}      icon={<CalendarDays />}tone="var(--color-info)" />
        <StatCard label="Chantiers"          value={(chantiers ?? []).length}      icon={<Building2 />}   tone="var(--color-rest)" />
        <StatCard label="Bons de commande"   value={(bcs ?? []).length}            icon={<Receipt />}     tone="var(--color-brand-500)" />
      </div>
    </>
  );
}
