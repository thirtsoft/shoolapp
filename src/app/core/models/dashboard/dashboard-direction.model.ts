export interface DashboardKpiElevesInscrits {
  nombreElevesInscrits: number;
  nombreReinscriptionsATraiter: number;
}

export interface DashboardKpiPresence {
  nombreElevesInscrits: number;
  nombreElevesAppeles: number;
  nombreElevesPresents: number;
  nombreElevesAbsents: number;
  tauxPresence: number;
}

export interface DashboardKpiRecouvrement {
  montantAttendu: number;
  montantEncaisse: number;
  montantAEncaisser: number;
  montantEnRetard: number;
  tauxRecouvrement: number;
  paiementsPrioritaires: DashboardPaiementPrioritaire[];
}

export interface DashboardPaiementPrioritaire {
  eleveUuid: string;
  eleve: string;
  classe: string;
  montant: number;
  echeance: string;
  statut: 'EN RETARD' | 'À VENIR';
}

export interface DashboardKpiEvaluations {
  evaluationsACorriger: number;
}

export interface DashboardEleveSuivi {
  /*
  eleveUuid: string;
  eleve: string;
  classe: string;
  absences: number;
  retards: number;
  motif: string;
  niveau: 'attention' | 'alerte';*/

  eleveId: number;
  nom: string;
  prenom: string;
  classe: string;
  nombreAbsences: number;
  nombreRetards: number;
  niveau: 'attention' | 'alerte';
}

export interface DashboardKpiPedagogie {
  tauxCahierTexte: number;
  classesPedagogiquesAverifier: number;
}