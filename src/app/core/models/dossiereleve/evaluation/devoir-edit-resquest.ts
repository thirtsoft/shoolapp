import { NoteEditRequest } from "../note/note-edit-request";


export interface DevoirEditRequest {
  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  enseignementId?: number;

  type?: string;


  etatId?: number;

  heureDebut?: string;

  heureFin?: string;

  actif?: number;

  noteEditRequestDTOList?: NoteEditRequest[];

}

