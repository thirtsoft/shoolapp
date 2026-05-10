import { PieceJointe } from "../piecejointe/piece-jointe";

export interface Exercice {
    id?: number;

    titre?: string;

    page?: string;

    numeroExercice?: string;

    description?: string;

    url?: string;

    piece_jointe?: string;

    enseignant?: number;

    classe?: number;

    livre?: number;

    dateDebut?: Date;

    dateFin?: Date;

    piecesJointesDTO?: PieceJointe;
    //

}