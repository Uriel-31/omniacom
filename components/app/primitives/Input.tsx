import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
      {children}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint [&>svg]:size-4">
          {icon}
        </span>
      )}
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink",
          "placeholder:text-faint transition-colors",
          "focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none",
          icon && "pl-9",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink-soft",
        "focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
