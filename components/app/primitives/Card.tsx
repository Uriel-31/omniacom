import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn("rounded-[var(--radius-card)] border border-line bg-surface", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-5 py-4", className)}>
      <div className="flex items-center gap-2 text-ink">
        {icon && <span className="text-muted [&>svg]:size-4">{icon}</span>}
        <h3 className="font-display text-[15px] font-semibold tracking-tight">{title}</h3>
      </div>
      {action}
    </div>
  );
}
