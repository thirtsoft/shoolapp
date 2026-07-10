export interface DetailsSessionSemestre {
    id?: number;

    semestre?: number;

    libelleSemestre?: string;

    anneeScolaireId?: number;

     libelleAnneeScolaire?: string;


    dateDebut?: Date;

    dateFin?: Date;

    etat?: number;

    libelleEtat?: string;

    actif?: number;
}