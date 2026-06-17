// ---------------------------------------------------------------------------
// Point d'entree consolide des types du projet
//
// Utilisation :
//   import type { User, LoginPayload } from "@/types";
// ---------------------------------------------------------------------------

export type {
  User,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  AuthContextType,
  AuthProviderProps,
} from "./auth";

export type {
  PaginatedResponse,
  CrudParams,
  UseCrudOptions,
  UseCrudReturn,
} from "./crud";
