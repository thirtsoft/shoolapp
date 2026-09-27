import { PieceJointe } from "../piecejointe/piece-jointe";

export interface CreateEnseignantResponse {
    enseignantId: number;

    enseignantUuid: string;

    photoProvided: boolean;

    photoStored: boolean;

    photoMessage: string;

}