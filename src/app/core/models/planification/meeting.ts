
export interface Meeting {
    id?: number;

    libelle?: string;

    dateMeeting?: Date;

    heureDebut?: string;

    heureFin?: string;

    description?: string;

    typeReunionId?: number;

    typeReunion?: string;

    salleId?: number;

    salle?: string;

    cible?: string;

    actif?: number;

}