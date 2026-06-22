"use client";

import { Building2, CheckCircle2, Clock, Receipt, Wallet, AlertCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/primitives/misc";
import { StatCard } from "@/components/app/primitives/StatCard";
import { Loader } from "@/components/app/brand/Logo";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { formatMontant } from "@/lib/utils";

export default function PmoDashboard() {
  const { data: chantiers, loading: lc } = useAsync(() => api.chantiers(), []);
  const { data: bc,        loading: lb } = useAsync(() => api.bonsCommande(), []);

  if (lc || lb) return <Loader label="Chargement du tableau de bord…" />;

  const ch   = chantiers ?? [];
  const bons = bc ?? [];

  const enCours   = ch.filter((c) => c.status === "ON_GOING" || c.status === "APD_ON_GOING").length;
  const termines  = ch.filter((c) => c.status === "DONE").length;
  const incidents = ch.filter((c) => c.status === "LANDLORD_ISSUE" || c.status === "NEED_CLEAN_SITE").length;

  const totalPO      = bons.reduce((s, b) => s + b.montantPo, 0);
  const totalFacture = bons.reduce((s, b) => s + b.montantFacture, 0);
  const totalRestant = bons.reduce((s, b) => s + b.montantRestant, 0);
  const tauxFactu    = totalPO ? (totalFacture / totalPO) * 100 : 0;

  return (
    <>
      <PageHeader
        title="Tableau de bord PMO"
        subtitle="Vue d'ensemble des chantiers et des finances."
      />

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Chantiers</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Total chantiers" value={ch.length}  icon={<Building2 />}    tone="var(--color-brand-500)" />
        <StatCard label="En cours"        value={enCours}    icon={<Clock />}         tone="var(--color-info)" />
        <StatCard label="Terminés"        value={termines}   icon={<CheckCircle2 />}  tone="var(--color-ok)" />
        <StatCard label="Incidents"       value={incidents}  icon={<AlertCircle />}   tone="var(--color-warn)" />
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Bons de commande</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total bons de commande" value={bons.length} icon={<Receipt />}  tone="var(--color-rest)" />
        <StatCard label="Montant total PO"       value={formatMontant(totalPO)} icon={<Wallet />} tone="var(--color-brand-500)" />
        <StatCard label="Facturé"                value={formatMontant(totalFacture)} percent={tauxFactu} tone="var(--color-ok)" />
        <StatCard label="Restant à payer"        value={formatMontant(totalRestant)} icon={<TrendingUp />} tone="var(--color-warn)" />
        <StatCard label="BC soldés"              value={bons.filter((b) => b.montantRestant === 0).length} icon={<CheckCircle2 />} tone="var(--color-ok)" />
      </div>
    </>
  );
}
