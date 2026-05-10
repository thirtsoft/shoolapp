import { NoteEditRequest } from "../note/note-edit-request";


export interface CompositionEditRequest {
  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  dateCreation?: Date;

  enseignementId?: number;

  type?: string;

  etatId?: number;

  heureDebut?: string;

  heureFin?: string;

  actif?: number;

  noteEditRequestDTOList?: NoteEditRequest[];

}
