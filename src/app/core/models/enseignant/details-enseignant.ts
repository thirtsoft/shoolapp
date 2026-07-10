import { PieceJointe } from "../piecejointe/piece-jointe";
import { ListConges } from "../planification/list-conge";
import { ListeCours } from "../planification/liste-cours";
import { ListeEnseignement } from "../planification/liste-enseignement";
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

    congesDTOList?: ListConges[];

    listEnseignementDTOList?: ListeEnseignement[];

    utilisateurDTO?: Utilisateur;

    active?: boolean;

    actif?: number;

}