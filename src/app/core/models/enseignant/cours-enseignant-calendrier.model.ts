
export interface CoursEnseignantCalendrier {
    coursId: number;
    libelle: string;
    courseUuid: string;

    jourSemaine: string;
    heureDebut: string;
    heureFin: string;

    salle: SalleResponse | null;
    classe: ClasseResponse | null;
    matiere: MatiereResponse | null;
    anneeScolaire: AnneeScolaireResponse | null;
    emploiDuTemps: EmploiDuTempsResponse | null;

    enseignementId: number;


    dateDebut: string | null;
    dateFin: string | null;
}

export interface SalleResponse {
    id: number;
    libelle: string;
}

export interface ClasseResponse {
    id: number;
    libelle: string;
}

export interface MatiereResponse {
    id: number;
    libelle: string;
}

export interface AnneeScolaireResponse {
    id: number;
    libelle: string;
}

export interface EmploiDuTempsResponse {
    id: number;
    titre: string;
}
