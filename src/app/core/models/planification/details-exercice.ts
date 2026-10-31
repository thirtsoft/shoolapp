import { DocumentResponse } from "../../piecejointe/document-response.model";

export interface DetailsExercice {
    id?: number;

    numeroExercice?: string;

    titre?: string;

    page?: string;

    description?: string;

    url?: string;

    enseignant?: string;

    matiere?: string;

    classe?: string;

    livre?: string;

    anneeScolaire?: string;

    libelleEtat?: string;

    dateDebut?: Date;

    dateFin?: Date;

    dateCreation?: Date;

    datePublication?: Date;

    documentResponse?: DocumentResponse;

    recordStatus?: string;

}