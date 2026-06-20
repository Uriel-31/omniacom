"use client";

/**
 * Contexte et hook d'authentification.
 *
 * Utilisation :
 *   import { AuthProvider, useAuth } from "@/hooks/use-auth";
 *
 *   // Dans le layout racine :
 *   <AuthProvider>{children}</AuthProvider>
 *
 *   // Dans un composant :
 *   const { user, isLoading, isAuthenticated, login, logout } = useAuth();
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth, getToken } from "@/lib/auth";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  AuthContextType,
  AuthProviderProps,
} from "@/types";

// ---------------------------------------------------------------------------
// Contexte
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!getToken());

  const refresh = useCallback(async () => {
    try {
      const profile = await auth.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  // Au montage, si un token existe, charger le profil
  useEffect(() => {
    if (!isLoading) return;

    let ignore = false;

    async function loadProfile() {
      try {
        const profile = await auth.getProfile();
        if (!ignore) setUser(profile);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [isLoading]);

  const login = useCallback(async (payload: LoginPayload) => {
    const user = await auth.login(payload);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const user = await auth.register(payload);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook pour acceder au contexte d'authentification.
 *
 * @throws Si utilise en dehors d'un AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit etre utilise a l'interieur d'un <AuthProvider>.",
    );
  }

  return context;
}
