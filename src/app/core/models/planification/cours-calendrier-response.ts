
export interface CoursCalendrier {
    coursId?: number;
    libelle?: string;
    courseUuid?: string;
    couleur?: string;
    type?: string;

    jourSemaine?: string;
    heureDebut?: string;
    heureFin?: string;

    salle?: SalleResponse | null;
    classe?: ClasseResponse | null;
    matiere?: MatiereResponse | null;
    anneeScolaire?: AnneeScolaireResponse | null;
    emploiDuTemps?: EmploiDuTempsResponse | null;

    enseignementId?: number;

    enseignant?: string;


    dateDebut?: string | null;
    dateFin?: string | null;
}

export interface SalleResponse {
    id: number;
    libelle: string;
}

export interface ClasseResponse {
    id: number;
    classeUuid: string;
    libelle: string;
}

export interface MatiereResponse {
    id: number;
    libelle: string;
}

export interface AnneeScolaireResponse {
    id: number;
    anneeScolaireUuid: string;
    libelle: string;
    etat: string;
    dateDebut: Date;
    dateFin: Date;
    anneeDebut: string;
}

export interface EmploiDuTempsResponse {
    id: number;
    titre: string;
}

export interface CalendrierAdministrationResponse {
    anneeScolaire: AnneeScolaireResponse;
    classes: ClasseResponse[];
    classeSelectionnee: ClasseResponse;
}
