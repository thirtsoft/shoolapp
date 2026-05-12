

export interface ListeInscription {
    id?: number;

    code?: string;

    nomCompletEleve?: string;

    classe?: string;

    anneeScolareDebut?: string;

    anneeScolareFin?: string;

    montantInscription?: number;

    dateInscription?: Date;

    createdBy?: number;

    eleve?: any;

    prenomEleve?: string;

    nomEleve?: string;

}