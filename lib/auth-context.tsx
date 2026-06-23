"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User, Role } from "@/types";
import { api, storage } from "./api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      setUser(storage.getUser());
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    router.push("/login");
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

/** Renvoie les rôles autorisés à accéder à un chemin donné. */
export function allowedRolesFor(pathname: string): Role[] {
  if (pathname.startsWith("/planning")) return ["GESTIONNAIRE_PLANNING", "ADMIN"];
  if (pathname.startsWith("/epi"))      return ["GESTIONNAIRE_EPI", "ADMIN"];
  if (pathname.startsWith("/pmo"))      return ["PMO", "ADMIN"];
  if (pathname.startsWith("/admin"))    return ["ADMIN"];
  return ["GESTIONNAIRE_PLANNING", "GESTIONNAIRE_EPI", "PMO", "ADMIN", "UTILISATEUR"];
}
