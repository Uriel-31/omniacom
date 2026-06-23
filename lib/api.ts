import axios from "axios";
import type {
  User, Technicien, Site, Intervention, Presence,
  VerificationEpi, Chantier, BonDeCommande, Equipement,
  EtapeChantier, LigneFacturation, ApiResponse,
} from "@/types";

const TOKEN_KEY = "omniacom_token";
const USER_KEY  = "omniacom_user";

// ---------- Stockage du token / utilisateur ----------
export const storage = {
  getToken: (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    // Sync to cookie so Next.js middleware can read it server-side
    if (typeof window !== "undefined") {
      document.cookie = `access_token=${encodeURIComponent(t)}; path=/; max-age=86400; SameSite=Lax`;
    }
  },
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  setUser: (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (typeof window !== "undefined") {
      document.cookie = "access_token=; path=/; max-age=0";
    }
  },
};

// ---------- Instance Axios avec intercepteur JWT ----------
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      storage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// ---------- Helpers ----------

/** Extrait data[] d'une réponse paginée backend { success, data, total, ... }. */
async function getList<T>(path: string): Promise<T[]> {
  const res = await http.get<ApiResponse<T[]>>(path);
  return res.data.data;
}

/** Extrait data d'une réponse simple backend { success, data }. */
async function getOne<T>(path: string): Promise<T> {
  const res = await http.get<ApiResponse<T>>(path);
  return res.data.data;
}

// ============================================================
// API publique
// ============================================================
export const api = {
  async login(email: string, motDePasse: string): Promise<User> {
    const res = await http.post<ApiResponse<{ utilisateur: User; token: string }>>(
      "/auth/login",
      { email, motDePasse },
    );
    const { utilisateur, token } = res.data.data;
    storage.setToken(token);
    storage.setUser(utilisateur);
    return utilisateur;
  },

  logout() {
    storage.clear();
  },

  async me(): Promise<User> {
    const res = await http.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },

  // --- Admin : utilisateurs ---
  users: () => getList<User>("/utilisateurs"),

  async createUser(payload: { nom: string; email: string; role: string; motDePasse: string }): Promise<User> {
    const res = await http.post<ApiResponse<User>>("/auth/register", payload);
    return res.data.data;
  },

  async updateUser(id: number, payload: Partial<User>): Promise<User> {
    const res = await http.put<ApiResponse<User>>(`/utilisateurs/${id}`, payload);
    return res.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await http.delete(`/utilisateurs/${id}`);
  },

  auditLogs: () => getList<import("@/types").AuditLog>("/admin/logs"),

  // --- Techniciens ---
  techniciens: () => getList<Technicien>("/techniciens"),

  async createTechnicien(payload: Omit<Technicien, "id">): Promise<Technicien> {
    const res = await http.post<ApiResponse<Technicien>>("/techniciens", payload);
    return res.data.data;
  },

  async updateTechnicien(id: number, payload: Partial<Technicien>): Promise<Technicien> {
    const res = await http.put<ApiResponse<Technicien>>(`/techniciens/${id}`, payload);
    return res.data.data;
  },

  async deleteTechnicien(id: number): Promise<void> {
    await http.delete(`/techniciens/${id}`);
  },

  // --- Sites ---
  sites: () => getList<Site>("/sites"),

  async createSite(payload: Omit<Site, "id">): Promise<Site> {
    const res = await http.post<ApiResponse<Site>>("/sites", payload);
    return res.data.data;
  },

  async updateSite(id: number, payload: Partial<Site>): Promise<Site> {
    const res = await http.put<ApiResponse<Site>>(`/sites/${id}`, payload);
    return res.data.data;
  },

  async deleteSite(id: number): Promise<void> {
    await http.delete(`/sites/${id}`);
  },

  // --- Interventions ---
  interventions: () => getList<Intervention>("/interventions"),

  async createIntervention(payload: Omit<Intervention, "id" | "site" | "technicien">): Promise<Intervention> {
    const res = await http.post<ApiResponse<Intervention>>("/interventions", payload);
    return res.data.data;
  },

  async updateIntervention(id: number, payload: Partial<Intervention>): Promise<Intervention> {
    const res = await http.put<ApiResponse<Intervention>>(`/interventions/${id}`, payload);
    return res.data.data;
  },

  async deleteIntervention(id: number): Promise<void> {
    await http.delete(`/interventions/${id}`);
  },

  // --- Présences ---
  presences: () => getList<Presence>("/presences"),

  async createPresence(payload: Omit<Presence, "id" | "technicien">): Promise<Presence> {
    const res = await http.post<ApiResponse<Presence>>("/presences", payload);
    return res.data.data;
  },

  async updatePresence(id: number, payload: Partial<Presence>): Promise<Presence> {
    const res = await http.put<ApiResponse<Presence>>(`/presences/${id}`, payload);
    return res.data.data;
  },

  // --- EPI : vérifications ---
  verifications: () => getList<VerificationEpi>("/verifications-epi"),

  async createVerification(payload: Omit<VerificationEpi, "id" | "technicien" | "equipements">): Promise<VerificationEpi> {
    const res = await http.post<ApiResponse<VerificationEpi>>("/verifications-epi", payload);
    return res.data.data;
  },

  async updateVerification(id: number, payload: Partial<VerificationEpi>): Promise<VerificationEpi> {
    const res = await http.put<ApiResponse<VerificationEpi>>(`/verifications-epi/${id}`, payload);
    return res.data.data;
  },

  async deleteVerification(id: number): Promise<void> {
    await http.delete(`/verifications-epi/${id}`);
  },

  // --- EPI : équipements ---
  equipements: () => getList<Equipement>("/equipements"),

  async createEquipement(payload: Omit<Equipement, "id">): Promise<Equipement> {
    const res = await http.post<ApiResponse<Equipement>>("/equipements", payload);
    return res.data.data;
  },

  async updateEquipement(id: number, payload: Partial<Equipement>): Promise<Equipement> {
    const res = await http.put<ApiResponse<Equipement>>(`/equipements/${id}`, payload);
    return res.data.data;
  },

  async deleteEquipement(id: number): Promise<void> {
    await http.delete(`/equipements/${id}`);
  },

  // --- PMO : chantiers ---
  chantiers: () => getList<Chantier>("/chantiers"),

  async createChantier(payload: Omit<Chantier, "id" | "etapes" | "bonsDeCommande">): Promise<Chantier> {
    const res = await http.post<ApiResponse<Chantier>>("/chantiers", payload);
    return res.data.data;
  },

  async updateChantier(id: number, payload: Partial<Chantier>): Promise<Chantier> {
    const res = await http.put<ApiResponse<Chantier>>(`/chantiers/${id}`, payload);
    return res.data.data;
  },

  async deleteChantier(id: number): Promise<void> {
    await http.delete(`/chantiers/${id}`);
  },

  // --- PMO : étapes chantier ---
  chantier: (id: number) => getOne<Chantier>(`/chantiers/${id}`),

  etapesChantier: (chantierId: number) =>
    getList<EtapeChantier>(`/etapes-chantier?chantierId=${chantierId}`),

  async createEtapeChantier(payload: Omit<EtapeChantier, "id">): Promise<EtapeChantier> {
    const res = await http.post<ApiResponse<EtapeChantier>>("/etapes-chantier", payload);
    return res.data.data;
  },

  async deleteEtapeChantier(id: number): Promise<void> {
    await http.delete(`/etapes-chantier/${id}`);
  },

  // --- PMO : bons de commande ---
  bonsCommande: () => getList<BonDeCommande>("/bons-de-commande"),

  bonCommande: (id: number) => getOne<BonDeCommande>(`/bons-de-commande/${id}`),

  async createBonCommande(payload: Omit<BonDeCommande, "id" | "lignes">): Promise<BonDeCommande> {
    const res = await http.post<ApiResponse<BonDeCommande>>("/bons-de-commande", payload);
    return res.data.data;
  },

  async updateBonCommande(id: number, payload: Partial<BonDeCommande>): Promise<BonDeCommande> {
    const res = await http.put<ApiResponse<BonDeCommande>>(`/bons-de-commande/${id}`, payload);
    return res.data.data;
  },

  async deleteBonCommande(id: number): Promise<void> {
    await http.delete(`/bons-de-commande/${id}`);
  },

  // --- PMO : lignes de facturation ---
  lignesFacturation: (bonId: number) =>
    getList<LigneFacturation>(`/lignes-facturation?bonDeCommandeId=${bonId}`),

  async createLigneFacturation(payload: Omit<LigneFacturation, "id">): Promise<LigneFacturation> {
    const res = await http.post<ApiResponse<LigneFacturation>>("/lignes-facturation", payload);
    return res.data.data;
  },

  async deleteLigneFacturation(id: number): Promise<void> {
    await http.delete(`/lignes-facturation/${id}`);
  },

  // --- Paramètres applicatifs ---
  async getSettings(): Promise<Record<string, string>> {
    const res = await http.get<ApiResponse<Record<string, string>>>("/admin/settings");
    return res.data.data;
  },

  async updateSettings(payload: Record<string, string>): Promise<void> {
    await http.put("/admin/settings", payload);
  },
};
