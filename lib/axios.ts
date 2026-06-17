/**
 * Instance Axios preconfiguree.
 *
 * - URL de base depuis les variables d'environnement
 * - Attache automatiquement le token JWT (Bearer) aux requetes
 * - Gere les erreurs 401 (token expire → redirection connexion)
 *
 * Utilisation :
 *   import { api } from "@/lib/axios";
 *   const { data } = await api.get("/endpoint");
 */

import axios, { type AxiosError } from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// Intercepteur de requete : attache le token Bearer
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Intercepteur de reponse : gere les 401
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();

      // Rediriger vers la page de connexion
      if (typeof window !== "undefined") {
        // Eviter les boucles de redirection si on est deja sur /auth/*
        const pathname = window.location.pathname;
        if (!pathname.startsWith("/auth/")) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        }
      }
    }

    return Promise.reject(error);
  },
);
