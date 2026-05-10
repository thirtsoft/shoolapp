import { PieceJointe } from "../../piecejointe/piece-jointe";

export interface EleveEdit {
    id?: number;

    matricule?: string;

    nom?: string;

    prenom?: string;

    sexe?: string;

    lieuNaissance?: string;

    dateNaissance?: string;

    nationalite?: string;

    address?: string;

    piecesJointesDTO?: PieceJointe;
}