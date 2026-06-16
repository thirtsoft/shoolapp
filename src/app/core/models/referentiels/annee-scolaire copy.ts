import { SessionSemestre } from "./session-semestre";

export interface DetailsAnneeScolaire {
    id?: number;

    libelle?: string;

    codeEtat?: string;

    etat?: string;

    dateDebut?: Date;

    dateFin?: Date;

    ecole?: number;

    listSessionSemestreDTOList?: SessionSemestre[];

}