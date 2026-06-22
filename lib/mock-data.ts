import type {
  User, Technicien, Site, Intervention, Presence,
  VerificationEpi, Chantier, BonDeCommande, Equipement,
  EtapeChantier, LigneFacturation,
} from "@/types";

const today = new Date();
const iso = (offsetDays = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const MOCK_USERS: User[] = [
  { id: 1, nom: "Jean Planning",  email: "j.planning@omniacom.cm",  role: "GESTIONNAIRE_PLANNING" },
  { id: 2, nom: "Marc EPI",       email: "m.epi@omniacom.cm",       role: "GESTIONNAIRE_EPI"      },
  { id: 3, nom: "Sophie PMO",     email: "s.pmo@omniacom.cm",       role: "PMO"                   },
  { id: 4, nom: "Admin Système",  email: "admin@omniacom.cm",       role: "ADMIN"                 },
];

export const MOCK_TECHNICIENS: Technicien[] = [
  { id: 1, nom: "Benali",   prenom: "Yassine", telephone: "+237 690 11 22 33", status: "ACTIF"   },
  { id: 2, nom: "Fekih",    prenom: "Mehdi",   telephone: "+237 691 44 55 66", status: "ACTIF"   },
  { id: 3, nom: "Mansour",  prenom: "Zied",    telephone: "+237 692 77 88 99", status: "ACTIF"   },
  { id: 4, nom: "Amrani",   prenom: "Karim",   telephone: "+237 693 00 11 22", status: "ACTIF"   },
  { id: 5, nom: "Belkacem", prenom: "Sami",    telephone: "+237 694 33 44 55", status: "INACTIF" },
  { id: 6, nom: "Dridi",    prenom: "Omar",    telephone: "+237 695 66 77 88", status: "ACTIF"   },
];

export const MOCK_SITES: Site[] = [
  { id: 1, nom: "Site Douala-01",      localisation: "Douala, Akwa",      region: "Littoral" },
  { id: 2, nom: "Site Yaoundé-04",     localisation: "Yaoundé, Bastos",   region: "Centre"   },
  { id: 3, nom: "Site Bafoussam-02",   localisation: "Bafoussam Centre",  region: "Ouest"    },
  { id: 4, nom: "Site Garoua-01",      localisation: "Garoua Nord",       region: "Nord"     },
];

export const MOCK_INTERVENTIONS: Intervention[] = [
  { id: 1, siteId: 1, technicienId: 1, timestampDebut: `${iso(0)}T08:00:00Z`, typeAction: "MAINTENANCE",  statut: "EN_COURS" },
  { id: 2, siteId: 2, technicienId: 2, timestampDebut: `${iso(1)}T09:00:00Z`, typeAction: "INSTALLATION", statut: "PLANIFIE" },
  { id: 3, siteId: 3, technicienId: 3, timestampDebut: `${iso(-1)}T07:00:00Z`,typeAction: "DEPANNAGE",    statut: "TERMINE"  },
  { id: 4, siteId: 4, technicienId: 4, timestampDebut: `${iso(2)}T10:00:00Z`, typeAction: "AUDIT",        statut: "PLANIFIE" },
];

export const MOCK_PRESENCES: Presence[] = [
  { id: 1, technicienId: 1, date: iso(0), statut: "PRESENT"     },
  { id: 2, technicienId: 2, date: iso(0), statut: "DEPLACEMENT" },
  { id: 3, technicienId: 3, date: iso(0), statut: "ABSENT"      },
  { id: 4, technicienId: 4, date: iso(0), statut: "MALADIE"     },
  { id: 5, technicienId: 5, date: iso(0), statut: "EN_CONGE"    },
  { id: 6, technicienId: 6, date: iso(0), statut: "ABSENT"      },
];

export const MOCK_EQUIPEMENTS: Equipement[] = [
  { id: 1, nom: "Casque de protection", status: "CONFORME"   },
  { id: 2, nom: "Harnais de sécurité",  status: "CONFORME"   },
  { id: 3, nom: "Gants isolants",       status: "EN_RETARD"  },
  { id: 4, nom: "Chaussures de sécurité",status: "CONFORME"  },
  { id: 5, nom: "Chasuble fluorescente", status: "DEFECTUEUX"},
];

export const MOCK_EPI: VerificationEpi[] = [
  {
    id: 1, technicienId: 1,
    dateDerniereVerif: iso(-12), dateDemande: iso(-10), dateEnvoie: iso(-9),
    joursRetard: 1, prochaineDate: iso(18), statut: "CONFORME",
    equipements: [MOCK_EQUIPEMENTS[0], MOCK_EQUIPEMENTS[1], MOCK_EQUIPEMENTS[2]],
    technicien: MOCK_TECHNICIENS[0],
  },
  {
    id: 2, technicienId: 2,
    dateDerniereVerif: iso(-40), dateDemande: iso(-35), dateEnvoie: iso(-20),
    joursRetard: 15, prochaineDate: iso(-10), statut: "EN_RETARD",
    equipements: [MOCK_EQUIPEMENTS[3], MOCK_EQUIPEMENTS[4]],
    technicien: MOCK_TECHNICIENS[1],
  },
  {
    id: 3, technicienId: 3,
    dateDerniereVerif: iso(-5), dateDemande: iso(-4), dateEnvoie: iso(-4),
    joursRetard: 0, prochaineDate: iso(25), statut: "CONFORME",
    equipements: [MOCK_EQUIPEMENTS[1]],
    technicien: MOCK_TECHNICIENS[2],
  },
  {
    id: 4, technicienId: 4,
    dateDerniereVerif: iso(-33), dateDemande: iso(-30), dateEnvoie: iso(-28),
    joursRetard: 2, prochaineDate: iso(-3), statut: "DEFECTUEUX",
    equipements: MOCK_EQUIPEMENTS,
    technicien: MOCK_TECHNICIENS[3],
  },
];

export const MOCK_CHANTIERS: Chantier[] = [
  {
    id: 1, entreprise: "OMNIACOM", codeSite: "CM-DLA-TWR-07",
    nomSite: "Tour Douala 07", typeSite: "Greenfield",
    status: "ON_GOING", avancementPlanifie: 75, avancementReel: 60, dateGo: iso(-60),
  },
  {
    id: 2, entreprise: "OMNIACOM", codeSite: "CM-YDE-TWR-12",
    nomSite: "Tour Yaoundé 12", typeSite: "Rooftop",
    status: "LANDLORD_ISSUE", avancementPlanifie: 50, avancementReel: 30, dateGo: iso(-90),
  },
  {
    id: 3, entreprise: "OMNIACOM", codeSite: "CM-BFS-TWR-03",
    nomSite: "Tour Bafoussam 03", typeSite: "Greenfield",
    status: "DONE", avancementPlanifie: 100, avancementReel: 100, dateGo: iso(-180),
  },
];

export const MOCK_ETAPES: EtapeChantier[] = [
  { id: 1, chantierId: 1, nomEtape: "Site Survey / Soil test", datePlanifiee: iso(-55), dateReelle: iso(-53), retardMinutes: 2880,  status: "TERMINE"   },
  { id: 2, chantierId: 1, nomEtape: "APD submission",          datePlanifiee: iso(-48), dateReelle: iso(-45), retardMinutes: 4320,  status: "TERMINE"   },
  { id: 3, chantierId: 1, nomEtape: "Mobilisation équipe",     datePlanifiee: iso(-40), dateReelle: iso(-42), retardMinutes: -2880, status: "TERMINE"   },
  { id: 4, chantierId: 1, nomEtape: "Implantation du site",    datePlanifiee: iso(-35), dateReelle: iso(-30), retardMinutes: 7200,  status: "EN_RETARD" },
  { id: 5, chantierId: 1, nomEtape: "Excavation / Fondation",  datePlanifiee: iso(-25), status: "EN_COURS"   },
  { id: 6, chantierId: 1, nomEtape: "Final RFI",               datePlanifiee: iso(5),   status: "EN_ATTENTE" },
  { id: 7, chantierId: 2, nomEtape: "Site Survey / Soil test", datePlanifiee: iso(-85), dateReelle: iso(-84), retardMinutes: 1440, status: "TERMINE"   },
  { id: 8, chantierId: 2, nomEtape: "APD submission",          datePlanifiee: iso(-78), dateReelle: iso(-70), retardMinutes: 11520,status: "EN_RETARD" },
  { id: 9, chantierId: 2, nomEtape: "Mobilisation équipe",     datePlanifiee: iso(-65), status: "EN_ATTENTE" },
];

export const MOCK_BC: BonDeCommande[] = [
  { id: 1, chantierId: 1, numeroBc: "BC-2401917", montantPo: 45_000_000, montantFacture: 30_000_000, montantRestant: 15_000_000, projetAssocie: "Extension Réseau Sud"    },
  { id: 2, chantierId: 2, numeroBc: "BC-2402055", montantPo: 62_500_000, montantFacture: 62_500_000, montantRestant: 0,          projetAssocie: "Densification Yaoundé"  },
  { id: 3, chantierId: 1, numeroBc: "BC-2402188", montantPo: 18_000_000, montantFacture: 9_000_000,  montantRestant: 9_000_000,  projetAssocie: "Maintenance Nord"        },
];

export const MOCK_LIGNES: LigneFacturation[] = [
  { id: 1, bonDeCommandeId: 1, montantHt: 15_000_000, statutPaiement: "PAYE",     dateFacture: iso(-30), description: "Travaux phase 1" },
  { id: 2, bonDeCommandeId: 1, montantHt: 15_000_000, statutPaiement: "EN_ATTENTE",dateFacture: iso(-10), description: "Travaux phase 2" },
  { id: 3, bonDeCommandeId: 2, montantHt: 62_500_000, statutPaiement: "PAYE",     dateFacture: iso(-45), description: "Solde total"      },
  { id: 4, bonDeCommandeId: 3, montantHt: 9_000_000,  statutPaiement: "EN_ATTENTE",dateFacture: iso(-5),  description: "Acompte 50%"     },
];

export const MOCK_AUDIT_LOGS = [
  { id:  1, date: iso(-1), utilisateurNom: "Admin Système",  utilisateurRole: "ADMIN",                action: "Création utilisateur",        module: "Utilisateurs" },
  { id:  2, date: iso(-1), utilisateurNom: "Sophie PMO",     utilisateurRole: "PMO",                  action: "Création chantier CM-DLA-TWR-07", module: "Chantiers" },
  { id:  3, date: iso(-1), utilisateurNom: "Marc EPI",       utilisateurRole: "GESTIONNAIRE_EPI",     action: "Modification vérification #2",  module: "EPI"       },
  { id:  4, date: iso(-2), utilisateurNom: "Jean Planning",  utilisateurRole: "GESTIONNAIRE_PLANNING",action: "Connexion",                    module: "Auth"       },
  { id:  5, date: iso(-2), utilisateurNom: "Sophie PMO",     utilisateurRole: "PMO",                  action: "Création bon de commande BC-2402188", module: "Bons de commande" },
  { id:  6, date: iso(-2), utilisateurNom: "Admin Système",  utilisateurRole: "ADMIN",                action: "Suppression utilisateur #5",   module: "Utilisateurs" },
  { id:  7, date: iso(-3), utilisateurNom: "Jean Planning",  utilisateurRole: "GESTIONNAIRE_PLANNING",action: "Création intervention #4",     module: "Interventions" },
  { id:  8, date: iso(-3), utilisateurNom: "Marc EPI",       utilisateurRole: "GESTIONNAIRE_EPI",     action: "Connexion",                    module: "Auth"       },
  { id:  9, date: iso(-4), utilisateurNom: "Sophie PMO",     utilisateurRole: "PMO",                  action: "Modification chantier #2",     module: "Chantiers"  },
  { id: 10, date: iso(-5), utilisateurNom: "Admin Système",  utilisateurRole: "ADMIN",                action: "Modification paramètres",      module: "Paramètres" },
];

// Série des 7 derniers jours pour le graphique des présences
export const MOCK_PRESENCE_SERIE = [
  { jour: "Lun", presents: 38, absents: 4 },
  { jour: "Mar", presents: 36, absents: 6 },
  { jour: "Mer", presents: 40, absents: 2 },
  { jour: "Jeu", presents: 35, absents: 7 },
  { jour: "Ven", presents: 39, absents: 3 },
  { jour: "Sam", presents: 18, absents: 1 },
  { jour: "Dim", presents: 12, absents: 0 },
];
