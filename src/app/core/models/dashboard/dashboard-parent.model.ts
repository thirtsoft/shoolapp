export interface EmploiDuTempsJourParentResponse {
  coursId: number;
  heureDebut: string;
  heureFin: string;
  matiere: string;
  professeur: string;
  salleId: number;
  salle: string;
}

export interface AssiduiteEleveParentResponse {
  nombreAbsences: number;
  nombreRetards: number;
}

export interface DashboardFinancierParentResponse {
  situationFinanciere: SituationFinanciereParentResponse;
  derniereFacture: DerniereFactureParentResponse | null;
}

export interface SituationFinanciereParentResponse {
  resteAPayer: number;
  devise: string;
  statut: string;
  nombreFactures: number;
  nombreFacturesEnRetard: number;
}

export interface DerniereFactureParentResponse {
  id: number;
  numeroFacture: string;
  montant: number;
  montantPaye: number;
  resteAPayer: number;
  dateFacture: Date;
  echeanceDate: Date;
  statut: string;
}

export interface DerniereNoteParentResponse {
  noteId: number;
  matiere: string;
  evaluation: string;
  note: number;
  date: Date;
}

export interface DerniereAbsenceParentResponse {
  absenceId: number;
  date: Date;
  matiere: string;
  statut: string;
  type: string;
}

export interface ProchaineEvaluationParentResponse {
  evaluationId: number;
  date: Date;
  matiere: string;
  libelle: string;
  heureDebut: string;
  heureFin: string;
  delai: string;
}

export interface ProchainExerciceParentResponse {
  exerciceId: number;
  date: Date;
  matiere: string;
  libelle: string;
  delai: string;
}

export interface ProchaineActiviteParentResponse {
  activiteId: number;
  date: Date;
  type: string;
  titre: string;
  heureDebut: string;
  heureFin: string;
  jour: string;
  mois: string;
  horaire: string;
  couleur: string;
}