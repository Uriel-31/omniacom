"use client";

import { useMemo, useState } from "react";
import { PageHeader, SearchInput, EmptyState } from "@/components/app/primitives/misc";
import { Card } from "@/components/app/primitives/Card";
import { Avatar } from "@/components/app/primitives/Avatar";
import { Loader } from "@/components/app/brand/Logo";
import { Table, THead, TBody, TR, TH, TD } from "@/components/app/primitives/Table";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { initiales } from "@/lib/utils";

export default function EpiTechniciensPage() {
  const { data, loading } = useAsync(() => api.techniciens(), []);
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => (data ?? []).filter((t) => `${t.prenom} ${t.nom}`.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );

  return (
    <>
      <PageHeader title="Techniciens" subtitle="Annuaire des techniciens suivis pour la conformité EPI." />
      <Card>
        <div className="border-b border-line p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Rechercher…" className="w-72 max-w-full" />
        </div>
        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState title="Aucun technicien" />
        ) : (
          <Table>
            <THead><TH>Technicien</TH><TH>Téléphone</TH></THead>
            <TBody>
              {filtered.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar initials={initiales(t.prenom, t.nom)} size={32} />
                      <span className="font-medium text-ink">{t.prenom} {t.nom}</span>
                    </div>
                  </TD>
                  <TD className="tabular text-muted">{t.telephone}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
