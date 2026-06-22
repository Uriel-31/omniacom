/**
 * Instance Axios préconsfigurée.
 * Le token JWT est géré dans lib/api.ts (storage.getToken).
 * Ce fichier reste disponible pour les appels directs ad-hoc.
 *
 * Usage :
 *   import { api } from "@/lib/api";   ← méthodes métier recommandées
 *   import { http } from "@/lib/axios"; ← appels bruts si nécessaire
 */

import axios from "axios";

const TOKEN_KEY = "omniacom_token";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// Alias legacy pour la compatibilité avec le README (import { api } from "@/lib/axios")
export { http as api };
