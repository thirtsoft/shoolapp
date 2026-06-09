
export interface Evaluation {
  id?: number;

  titre?: string;

  description?: string;

  dateEvaluation?: Date;

  dateRemise?: Date;

  enseignementId?: number;

  classeId?: number;

  evaluationType?: string;

  evaluationMode?: string;

  etatId?: number;

  semestre?: number;

  sessionSemestre?: number;

  createur?: number;

  heureDebut?: string;

  heureFin?: string;

  ecole?: number;

  actif?: number;

}