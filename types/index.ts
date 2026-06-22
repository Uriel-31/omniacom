// ============================================================
// Types métier OMNIACOM — alignés sur le schéma Prisma backend.
// ============================================================

// --- Rôles utilisateurs ---
export type Role =
  | "GESTIONNAIRE_PLANNING"
  | "GESTIONNAIRE_EPI"
  | "PMO"
  | "ADMIN"
  | "UTILISATEUR";

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  role: Role;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: number;
  date: string;
  utilisateurNom: string;
  utilisateurRole?: string;
  action: string;
  module?: string;
}

// --- Module Planning ---
export type TechnicienStatus = "ACTIF" | "INACTIF";

export interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  status: TechnicienStatus;
}

export interface Site {
  id: number;
  nom: string;
  localisation: string;
  region: string;
}

export type InterventionTypeAction = "MAINTENANCE" | "DEPANNAGE" | "INSTALLATION" | "AUDIT";
export type InterventionStatut = "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE" | "REPORTE";

export interface Intervention {
  id: number;
  siteId: number;
  technicienId: number;
  timestampDebut: string;
  timestampFin?: string;
  typeAction: InterventionTypeAction;
  statut: InterventionStatut;
  site?: Site;
  technicien?: Technicien;
}

export type PresenceStatut = "PRESENT" | "ABSENT" | "EN_CONGE" | "MALADIE" | "DEPLACEMENT";

export interface Presence {
  id: number;
  technicienId: number;
  interventionsId?: number;
  date: string;
  statut: PresenceStatut;
  technicien?: Technicien;
}

// --- Module EPI ---
export type EquipementStatus = "CONFORME" | "EN_RETARD" | "DEFECTUEUX" | "HORS_SERVICE";

export interface Equipement {
  id: number;
  nom: string;
  status: EquipementStatus;
}

export type VerificationEPIStatut = "CONFORME" | "EN_RETARD" | "DEFECTUEUX";

export interface VerificationEpi {
  id: number;
  technicienId: number;
  dateDerniereVerif: string;
  dateDemande: string;
  dateEnvoie: string;
  joursRetard: number;
  prochaineDate: string;
  statut: VerificationEPIStatut;
  technicien?: Technicien;
  equipements?: Equipement[];
}

// --- Module PMO ---
export type ChantierStatus =
  | "DONE"
  | "ON_GOING"
  | "NEED_CLEAN_SITE"
  | "LANDLORD_ISSUE"
  | "APD_ON_GOING";

export interface Chantier {
  id: number;
  entreprise: string;
  codeSite: string;
  nomSite: string;
  typeSite: string;
  status: ChantierStatus;
  avancementPlanifie?: number;
  avancementReel?: number;
  dateGo?: string;
  etapes?: EtapeChantier[];
  bonsDeCommande?: BonDeCommande[];
}

export type EtapeChantierStatus = "EN_ATTENTE" | "EN_COURS" | "TERMINE" | "EN_RETARD";

export interface EtapeChantier {
  id: number;
  chantierId: number;
  nomEtape: string;
  datePlanifiee?: string;
  dateReelle?: string;
  retardMinutes?: number;
  status: EtapeChantierStatus;
}

export interface BonDeCommande {
  id: number;
  chantierId: number;
  numeroBc: string;
  montantPo: number;
  montantFacture: number;
  montantRestant: number;
  projetAssocie?: string;
  lignes?: LigneFacturation[];
}

export interface LigneFacturation {
  id: number;
  bonDeCommandeId: number;
  montantHt: number;
  statutPaiement: string;
  dateFacture?: string;
  description?: string;
}

// --- Réponse API standard backend ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
