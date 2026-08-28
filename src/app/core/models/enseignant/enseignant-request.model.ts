import { PieceJointe } from "../piecejointe/piece-jointe";

export interface EnseignantCreateRequest {
    id?: number;

    firstName?: string;

    lastName?: string;

    cni?: string;

    mobile?: string;

    address?: string;

    email?: string;

    situationMatrimoniale?: string;

    dateDebut?: Date;

    dateFin?: Date;

    niveauEducation?: string;

    piecesJointesDTO?: PieceJointe;

}