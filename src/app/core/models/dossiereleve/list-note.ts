

export interface ListNote {
    id?: number;

    eleve?: string;

    matiere?: string;

    semestre?: string;

    note?: number;

    type?: string;

    dateCreation?: Date;
}

export interface ListEleveNote {
    eleveId?: number;

    prenom?: string;

    nom?: string;

    classe?: string;

    note?: number;

}