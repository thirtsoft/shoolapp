import { DocumentResponse } from "../../../piecejointe/document-response.model";


export interface EvaluationDetailResponse {

  evaluationUuid?: string;

  numeroEvaluation?: string;

  titre?: string;

  description?: string;

  typeEvaluation?: string;

  evaluationMode?: string;

  dateCreation?: string;

  dateEvaluation?: string;

  heureDebut?: string;

  heureFin?: string;

  dureeMinutes?: number;

  datePlanification?: string;

  datePassage?: string;

  dateDebutCorrection?: string;

  dateTerminee?: string;

  etat?: string;


  nombreEleves?: number;

  nombreCopies?: number;

  nombreCopiesSaisies?: number;

  nombreAbsences?: number;

  moyenne?: number;

  noteMax?: number;

  noteMin?: number;

  createurNomComplet?: string;

  dernierModificateurNomComplet?: string;

  evaluationInformationsResponse?: EvaluationInformationsResponse;

  notes?: PageResponse<NoteEvaluationResponse>;


  documents?: DocumentResponse[];

}


export interface EvaluationInformationsResponse {

  matiereLibelle?: string;

  classeLibelle?: string;

  enseignantNomComplet?: string;

  anneeScolaireLibelle?: string;

  sessionSemestreLibelle?: string;

}


export interface NoteEvaluationResponse {

  eleve?: number;

  eleveUuid?: string;

  matricule?: string;

  nomComplet?: string;

  note?: number | null;

  typeNote?: string;

  appreciation?: string | null;

}


export interface PageResponse<T> {

  totalElements?: number;

  totalPages?: number;

  size?: number;

  number?: number;

  numberOfElements?: number;

  first?: boolean;

  last?: boolean;

  empty?: boolean;

  content?: T[];

  sort?: PageSort;

  pageable?: any;

}


export interface PageSort {

  empty?: boolean;

  unsorted?: boolean;

  sorted?: boolean;

}