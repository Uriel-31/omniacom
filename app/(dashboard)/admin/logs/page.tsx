"use client";

import { useState, useMemo } from "react";
import { ScrollText } from "lucide-react";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card, CardHeader } from "@/components/app/primitives/Card";
import { Badge } from "@/components/app/primitives/Badge";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { ROLE_LABEL, ROLE_TONE } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { Role } from "@/types";

const MODULE_TONE: Record<string, "ok" | "warn" | "danger" | "info" | "rest" | "neutral"> = {
  Auth:               "ok",
  Utilisateurs:       "danger",
  Chantiers:          "rest",
  "Bons de commande": "info",
  EPI:                "warn",
  Interventions:      "info",
  "Paramètres":       "neutral",
};

export default function LogsPage() {
  const { data, loading } = useAsync(() => api.auditLogs(), []);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = data ?? [];
    if (!q) return all;
    const ql = q.toLowerCase();
    return all.filter((l) =>
      `${l.utilisateurNom} ${l.action} ${l.module ?? ""}`.toLowerCase().includes(ql),
    );
  }, [data, q]);

  return (
    <>
      <PageHeader
        title="Logs d'audit"
        subtitle="Historique des actions effectuées sur la plateforme."
      />

      <Card>
        <CardHeader
          title="Journaux d'activité"
          icon={<ScrollText />}
          action={<SearchInput value={q} onChange={setQ} placeholder="Utilisateur, action…" className="w-64" />}
        />
        <div className="border-t border-line">
          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <EmptyState title="Aucun log" hint="Les actions des utilisateurs apparaîtront ici." />
          ) : (
            <Table>
              <THead>
                <TH>Date</TH>
                <TH>Utilisateur</TH>
                <TH>Rôle</TH>
                <TH>Action</TH>
                <TH>Module</TH>
              </THead>
              <TBody>
                {rows.map((l) => (
                  <TR key={l.id}>
                    <TD className="tabular text-muted">{formatDateShort(l.date)}</TD>
                    <TD className="font-medium text-ink">{l.utilisateurNom}</TD>
                    <TD>
                      {l.utilisateurRole ? (
                        <Badge tone={ROLE_TONE[l.utilisateurRole as Role] ?? "neutral"}>
                          {ROLE_LABEL[l.utilisateurRole as Role] ?? l.utilisateurRole}
                        </Badge>
                      ) : "—"}
                    </TD>
                    <TD className="text-muted">{l.action}</TD>
                    <TD>
                      {l.module ? (
                        <Badge tone={MODULE_TONE[l.module] ?? "neutral"}>{l.module}</Badge>
                      ) : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </Card>
    </>
  );
}
