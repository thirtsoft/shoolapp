export interface Classe {
    id?: number;
    libelle?: string;
    niveau?: number;
    capacite?: number;
    serie?: number;
    anneeScolaire?: number;
    ecole?: number;
    actif?: number;

}

export interface ListeClasse {
    id?: number;

    libelle?: string;

    niveau?: string;

    capacite?: number;

}


export interface ClasseListResponse {
    id?: number;

    uuid?: string;

    libelle?: string;

    capacite?: number;

}