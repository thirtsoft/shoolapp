export interface PieceJointe {
  id?: number;

  nomFichier?: string;

  nomTechnique?: string;

  typeDocumentId?: number;

  objectId?: number;

  dossier?: string;

  dateCreation?: Date;

  idDocument?: number;

  content?: string;
}

export interface PieceJointeResponse {
  uuid: number;

  storageFileUuid: string;

  typeDocumentUuid: string;

  typeDocumentCode: string;

  entityName: string;

  entityUid: string;

  entityReference: string;

  libelle: string;

  commentaire: string;

  principale: string;

  ordre: string;
}

