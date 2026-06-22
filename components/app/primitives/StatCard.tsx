import { cn } from "@/lib/utils";
import { Card } from "./Card";
import type { ReactNode } from "react";

/** Petit anneau de progression — réutilise le motif signature OMNIACOM. */
function ProgressRing({ value, tone = "var(--color-brand-500)" }: { value: number; tone?: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
      <circle
        cx="22" cy="22" r={r} fill="none" stroke={tone} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "var(--color-brand-500)",
  percent,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: string;
  percent?: number;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 font-display text-3xl font-bold tabular text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
        </div>
        {percent !== undefined ? (
          <div className="relative grid place-items-center">
            <ProgressRing value={percent} tone={tone} />
            <span className="absolute text-[11px] font-bold tabular" style={{ color: tone }}>
              {Math.round(percent)}%
            </span>
          </div>
        ) : (
          icon && (
            <span
              className={cn("grid size-11 place-items-center rounded-xl [&>svg]:size-5")}
              style={{ background: "color-mix(in srgb, " + tone + " 12%, white)", color: tone }}
            >
              {icon}
            </span>
          )
        )}
      </div>
    </Card>
  );
}
