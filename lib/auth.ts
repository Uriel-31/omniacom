/**
 * Gestion des tokens JWT et service d'authentification.
 *
 * Les tokens sont stockes dans localStorage et automatiquement
 * attaches aux requetes Axios via un intercepteur.
 *
 * Utilisation :
 *   import { auth, getToken } from "@/lib/auth";
 *   await auth.login(email, password);
 *   const token = getToken();
 */

import { api } from "./axios";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// Gestion du token (localStorage)
// ---------------------------------------------------------------------------

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/** Stocke le token d'acces dans localStorage. */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/** Recupere le token d'acces depuis localStorage. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Supprime le token d'acces. */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/** Stocke le refresh token. */
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_KEY, token);
}

/** Recupere le refresh token. */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

/** Supprime tous les tokens. */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ---------------------------------------------------------------------------
// Fonctions d'authentification
// ---------------------------------------------------------------------------

/**
 * Connecte un utilisateur.
 * Stocke les tokens et retourne l'utilisateur.
 */
export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);

  setToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);

  return data.user;
}

/**
 * Inscrit un nouvel utilisateur.
 * Stocke les tokens et retourne l'utilisateur.
 */
export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);

  setToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);

  return data.user;
}

/**
 * Deconnecte l'utilisateur.
 * Appelle l'API de deconnexion puis efface les tokens.
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Meme si l'API echoue, on efface les tokens localement
  } finally {
    clearTokens();
  }
}

/**
 * Recupere le profil de l'utilisateur connecte.
 * Le token est attache automatiquement par l'intercepteur Axios.
 */
export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

// ---------------------------------------------------------------------------
// Export consolide
// ---------------------------------------------------------------------------

export const auth = { login, register, logout, getProfile };
