
export interface EvaluationEditNote {
  id?: number;

  titre?: string;

  description?: string;

  dateEvaluation?: Date;

  dateRemise?: Date;

  dateCreation?: Date;

  enseignementId?: number;

  createur?: number;

  evaluationType?: string;

  evaluationMode?: string;

  classeId?: string;

  etatId?: number;

  heureDebut?: string;

  heureFin?: string;

  actif?: number;

  noteEditRequestDTOList?: NoteEditRequest[];

  coefficient?: number;

  noteMax?: number;

}


export interface NoteEditRequest {
  id?: number;

  eleve?: number;

  note?: number;

  type?: string;

  dateCreation?: Date;

  appreciation?: string;

  createur?: number;

}