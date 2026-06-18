
export interface SessionSemestre {
    id?: number;

    semestre?: string;

    codeSemestre?: string;

    anneeScolaire?: string;

    dateDebut?: Date;

    dateFin?: Date;

    etat?: string;
}

export interface SessionSemestreAddEdit {
    id?: number;

    semestre?: number;

    anneeScolaireId?: number;


    dateDebut?: Date;

    dateFin?: Date;

    etat?: number;
}