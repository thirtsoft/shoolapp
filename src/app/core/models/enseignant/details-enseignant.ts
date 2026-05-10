import { PieceJointe } from "../piecejointe/piece-jointe";
import { DetailsEnseignement } from "../planification/enseignement";
import { ListeCours } from "../planification/liste-cours";
import { Utilisateur } from "../utilisateur/utilisateur";


export interface DetailsEnseignant {
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

    listeCoursDTOS?: ListeCours[];

    congesDTOList?: ListeCours;

    detailsEnseignementDTO?: DetailsEnseignement;

    utilisateurDTO?: Utilisateur;

}