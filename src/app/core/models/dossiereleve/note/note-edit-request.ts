export interface NoteEditRequest {

  id?: number;

  eleve?: number;

  nomCompletEleve?: string;

  note?: number;

  type?: string;

  createur?: number;

  dateCreation?: Date;

  actif?: number;

}

export interface NoteEdit {

  id?: number;

  eleve?: number;

  nomCompletEleve?: string;

  classe?: number;

  libelleClasse?: string;

  evaluation?: number;

  evaluationTitre?: string;

  note?: number;

  type?: string;

  appreciation?: string;

  createur?: number;

  dateCreation?: Date;

  actif?: number;

}
