import { PieceJointe } from "../piecejointe/piece-jointe";

export interface Enseignant {
    id?: number;

    userId?: number;

    matricule?: string;

    username?: string;

    profession?: string;

    nom?: string;

    prenom?: string;

    cni?: string;

    civilite?: string;

    address?: string;

    telephone?: string;

    email?: string;

    situationMatrimoniale?: string;

    dateDebut?: Date;

    dateFin?: Date;

    niveauEducation?: string;

    piecesJointesDTO?: PieceJointe;

    /***    Enseignement  */
    idEnseignement?: number;
    classe?: number;
    anneeScolaire?: number;
    description?: string;
    dateDebutEnseignement?: Date;
}