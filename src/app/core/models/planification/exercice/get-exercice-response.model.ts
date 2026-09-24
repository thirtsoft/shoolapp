import { DocumentResponse } from "../../../piecejointe/document-response.model";

export interface GetExerciceResponse {
  id: number;

  exerciceUuid: string;

  titre: string;

  page: string;

  numeroExercice: string;

  description: string;

  url: string;

  enseignement: number;

  titreEnseignement: string

  enseignant: number;

  nomCompletEnseignant: string

  classId: number;

  libelleClasse: string;

  livre: number;

  dateDebut: Date;

  dateFin: Date;

  documentResponse: DocumentResponse;

  //
}