"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/app/brand/Logo";
import { Avatar } from "@/components/app/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { NAV_BY_ROLE, ROLE_LABEL } from "@/lib/constants";
import { cn, initiales } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar shadow-[2px_0_6px_rgba(20,23,26,0.06)]">
      {/* En-tête logo */}
      <div className="flex h-16 items-center px-5 border-b border-line">
        <Logo size={26} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-0.5">
        {items.map(({ label, href, icon: Icon }) => {
          // Un item plus spécifique a priorité — évite que le parent reste actif sur les sous-routes
          const hasMoreSpecific = items.some(
            (other) => other.href !== href && pathname.startsWith(other.href),
          );
          const active =
            pathname === href ||
            (!hasMoreSpecific && href !== "/" && pathname.startsWith(href + "/"));

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "ml-3 pl-3 pr-4 rounded-l-xl bg-canvas text-brand-700"
                  : "mx-3 px-3 rounded-xl text-ink-soft hover:bg-canvas hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  active ? "text-brand-500" : "text-faint group-hover:text-ink-soft",
                )}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur */}
      <div className="border-t border-line p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-canvas transition-colors"
        >
          <Avatar initials={initiales(user.nom)} photoUrl={user.photoUrl} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.nom}</p>
            <p className="truncate text-xs text-muted">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="size-4" />
          </button>
        </Link>
      </div>
    </aside>
  );
}
