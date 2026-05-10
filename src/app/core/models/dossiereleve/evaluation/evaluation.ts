
export interface Evaluation {
  id?: number;

  titre?: string;

  description?: string;

  dateEvaluation?: Date;

  dateRemise?: Date;

  enseignementId?: number;

  evaluationType?: string;

  evaluationMode?: string;

  etatId?: number;

  createur?: number;

  heureDebut?: string;

  heureFin?: string;

  ecole?: number;

  actif?: number;

}