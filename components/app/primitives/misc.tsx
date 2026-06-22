"use client";

import { Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Entête de page : titre + sous-titre + actions à droite. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** État vide explicite (pas de données encore). */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-canvas text-faint">
        <Inbox className="size-5" />
      </span>
      <p className="font-medium text-ink-soft">{title}</p>
      {hint && <p className="max-w-xs text-sm text-faint">{hint}</p>}
    </div>
  );
}

/** Champ de recherche. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
      />
    </div>
  );
}

/** Groupe de filtres en pastilles (ex : Tous / En retard / À jour). */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-canvas p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === opt ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink-soft",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
