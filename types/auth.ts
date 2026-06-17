// ---------------------------------------------------------------------------
// Types du module d'authentification
// ---------------------------------------------------------------------------

/** Utilisateur retourne par l'API. */
export interface User {
  id: string | number;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

/** Payload de connexion. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload d'inscription. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** Reponse de l'API apres login/register. */
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

/** Valeur du contexte d'authentification. */
export interface AuthContextType {
  /** Utilisateur connecte ou null. */
  user: User | null;
  /** Indique si le chargement du profil est en cours. */
  isLoading: boolean;
  /** Indique si un utilisateur est authentifie. */
  isAuthenticated: boolean;
  /** Connecte un utilisateur. */
  login: (payload: LoginPayload) => Promise<User>;
  /** Inscrit un utilisateur. */
  register: (payload: RegisterPayload) => Promise<User>;
  /** Deconnecte l'utilisateur. */
  logout: () => Promise<void>;
  /** Recharge le profil depuis l'API. */
  refresh: () => Promise<void>;
}

/** Props du provider d'authentification. */
export interface AuthProviderProps {
  children: React.ReactNode;
}
