import { PieceJointe } from "../piecejointe/piece-jointe";


export interface DetailsEnseignantUtilisateur {
    id?: number;

    userId?: number;

    matricule?: string;

    username?: string;

    nom?: string;

    prenom?: string;

    telephone?: string;

    email?: string;

    dateDebut?: Date;

    niveauEducation?: string;

    piecesJointesDTO?: PieceJointe;


}