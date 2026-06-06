import { PieceJointe } from "../piecejointe/piece-jointe";

export interface DetailsMeeting {
    id?: number;

    libelle?: string;

    dateMeeting?: Date;

    publicationDate?: Date;

    heureDebut?: string;

    heureFin?: string;

    description?: string;

    typeReunionId?: number;

    typeReunion?: string;

    salleId?: number;

    salle?: string;

    etatId?: number;

    etat?: string;

    etatCode?: string;

    motifAnnulation?: string;

    ecole?: number;

    actif?: number;


}