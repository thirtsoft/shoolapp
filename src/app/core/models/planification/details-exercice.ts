import { PieceJointe } from "../piecejointe/piece-jointe";

export interface DetailsExercice {
    id?: number;

    titre?: string;

    page?: string;

    numeroExercice?: string;

    description?: string;

    url?: string;

    piece_jointe?: string;

    enseignant?: string;

    classe?: string;

    livre?: string;

    dateDebut?: Date;

    dateFin?: Date;

    piecesJointesDTO?: PieceJointe;

}