"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Logo, Loader } from "@/components/app/brand/Logo";
import { useAuth, allowedRolesFor } from "@/lib/auth-context";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Garde d'accès : redirige si non connecté ou rôle non autorisé.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!allowedRolesFor(pathname).includes(user.role)) {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  if (loading || !user) return <Loader label="Chargement de votre espace…" />;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — bureau */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar — mobile (tiroir) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar mobile uniquement */}
        <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <Logo size={24} />
          <button onClick={() => setMobileOpen((o) => !o)} className="rounded-lg p-2 text-ink-soft hover:bg-canvas">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">{children}</div>
          <footer className="border-t border-line px-8 py-3 text-center text-xs text-faint">
            © {new Date().getFullYear()} OMNIACOM — Tous droits réservés
          </footer>
        </main>
      </div>
    </div>
  );
}
