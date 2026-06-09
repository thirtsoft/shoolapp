import { NoteEditRequest } from "../note/note-edit-request";


export interface EvaluationEditRequest {
  id?: number;

  titre?: string;

  description?: string;

  dateEvaluation?: Date;

  dateRemise?: Date;

  dateCreation?: Date;

  classeId?: number;

  enseignementId?: number;

  semestre?: number;

  sessionSemestre?: number;

  evaluationType?: string;

  evaluationMode?: string;

  etatId?: number;

  heureDebut?: string;

  heureFin?: string;

  ecole?: number;

  actif?: number;

  noteEditRequestDTOList?: NoteEditRequest[];

}

