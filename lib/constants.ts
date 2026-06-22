import {
  LayoutDashboard,
  Users,
  MapPin,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  Building2,
  Receipt,
  UserCog,
  HardHat,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type {
  Role,
  InterventionTypeAction,
  InterventionStatut,
  PresenceStatut,
  VerificationEPIStatut,
  ChantierStatus,
  TechnicienStatus,
  EtapeChantierStatus,
} from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  GESTIONNAIRE_PLANNING: [
    { label: "Tableau de bord",        href: "/planning",              icon: LayoutDashboard },
    { label: "Techniciens",            href: "/planning/techniciens",  icon: Users            },
    { label: "Sites d'intervention",   href: "/planning/sites",        icon: MapPin           },
    { label: "Plannings",              href: "/planning/interventions",icon: CalendarDays     },
    { label: "Feuilles de présence",   href: "/planning/presences",    icon: ClipboardList    },
  ],
  GESTIONNAIRE_EPI: [
    { label: "Dashboard",     href: "/epi",               icon: LayoutDashboard },
    { label: "Équipements",   href: "/epi/equipements",   icon: HardHat         },
    { label: "Vérifications", href: "/epi/verifications", icon: ShieldCheck     },
  ],
  PMO: [
    { label: "Dashboard",         href: "/pmo",                 icon: LayoutDashboard },
    { label: "Chantiers",         href: "/pmo/chantiers",       icon: Building2       },
    { label: "Bons de commande",  href: "/pmo/bons-commande",   icon: Receipt         },
  ],
  ADMIN: [
    { label: "Utilisateurs", href: "/admin/utilisateurs",  icon: UserCog         },
    { label: "Logs d'audit", href: "/admin/logs",          icon: ScrollText      },
    { label: "Paramètres",   href: "/admin/settings",      icon: Settings        },
  ],
  UTILISATEUR: [
    { label: "Tableau de bord", href: "/planning", icon: LayoutDashboard },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  GESTIONNAIRE_PLANNING: "Gestionnaire Planning",
  GESTIONNAIRE_EPI:      "Gestionnaire EPI",
  PMO:                   "PMO Officer",
  ADMIN:                 "Administrateur Système",
  UTILISATEUR:           "Utilisateur",
};

export const HOME_BY_ROLE: Record<Role, string> = {
  GESTIONNAIRE_PLANNING: "/planning",
  GESTIONNAIRE_EPI:      "/epi",
  PMO:                   "/pmo",
  ADMIN:                 "/admin/utilisateurs",
  UTILISATEUR:           "/planning",
};

// --- Libellés d'affichage (backend enum → texte français) ---

export const INTERVENTION_TYPE_LABEL: Record<InterventionTypeAction, string> = {
  MAINTENANCE:  "Maintenance préventive",
  DEPANNAGE:    "Dépannage / Urgence",
  INSTALLATION: "Installation",
  AUDIT:        "Audit / Inspection",
};

export const INTERVENTION_STATUT_LABEL: Record<InterventionStatut, string> = {
  PLANIFIE:  "Planifié",
  EN_COURS:  "En cours",
  TERMINE:   "Terminé",
  ANNULE:    "Annulé",
  REPORTE:   "Reporté",
};

export const PRESENCE_STATUT_LABEL: Record<PresenceStatut, string> = {
  PRESENT:     "Présent",
  ABSENT:      "Absent",
  EN_CONGE:    "Congé",
  MALADIE:     "Maladie",
  DEPLACEMENT: "Déplacement",
};

export const EPI_STATUT_LABEL: Record<VerificationEPIStatut, string> = {
  CONFORME:   "Conforme",
  EN_RETARD:  "En retard",
  DEFECTUEUX: "Défectueux",
};

export const CHANTIER_STATUS_LABEL: Record<ChantierStatus, string> = {
  DONE:            "Done",
  ON_GOING:        "On going",
  NEED_CLEAN_SITE: "Need Clean site",
  LANDLORD_ISSUE:  "Landlord issue",
  APD_ON_GOING:    "APD on going",
};

export const TECHNICIEN_STATUS_LABEL: Record<TechnicienStatus, string> = {
  ACTIF:   "Actif",
  INACTIF: "Inactif",
};

export const ETAPE_STATUS_LABEL: Record<EtapeChantierStatus, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS:   "En cours",
  TERMINE:    "Terminé",
  EN_RETARD:  "En retard",
};

// --- Variantes de couleur pour les badges ---
export type ToneVariant = "ok" | "warn" | "danger" | "info" | "rest" | "neutral";

export const PRESENCE_TONE: Record<PresenceStatut, ToneVariant> = {
  PRESENT:     "ok",
  ABSENT:      "danger",
  EN_CONGE:    "rest",
  MALADIE:     "warn",
  DEPLACEMENT: "info",
};

export const EPI_TONE: Record<VerificationEPIStatut, ToneVariant> = {
  CONFORME:   "ok",
  EN_RETARD:  "warn",
  DEFECTUEUX: "danger",
};

export const CHANTIER_TONE: Record<ChantierStatus, ToneVariant> = {
  DONE:            "ok",
  ON_GOING:        "info",
  NEED_CLEAN_SITE: "warn",
  LANDLORD_ISSUE:  "danger",
  APD_ON_GOING:    "rest",
};

export const INTERVENTION_TONE: Record<InterventionStatut, ToneVariant> = {
  PLANIFIE: "info",
  EN_COURS: "warn",
  TERMINE:  "ok",
  ANNULE:   "danger",
  REPORTE:  "rest",
};

export const TECHNICIEN_TONE: Record<TechnicienStatus, ToneVariant> = {
  ACTIF:   "ok",
  INACTIF: "rest",
};

export const ROLE_TONE: Record<Role, ToneVariant> = {
  GESTIONNAIRE_PLANNING: "info",
  GESTIONNAIRE_EPI:      "warn",
  PMO:                   "rest",
  ADMIN:                 "danger",
  UTILISATEUR:           "neutral",
};
