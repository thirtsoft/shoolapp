export interface ListAbsence {
    id?: number;

    eleve?: number;

    nomEleve?: string;

    prenomEleve?: string;

    nomCompletEleve?: string;

    sexeEleve?: string;

    anneeScolare?: string;

    semestre?: string;


    dateAbsence?: Date;

    date_declaration?: Date;

    libelleJustifiee?: string;

    typeSignalement?: string;

}