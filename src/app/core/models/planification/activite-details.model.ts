export interface ActiviteScolaireDetail {
    id?: number;
    type?: string;
    libelle?: string;
    description?: string;
    dateActivite?: string;
    heureDebut?: string;
    heureFin?: string;
    etatId?: number;
    etat?: string;
    typeReunion?: string;
    salle?: string;
    motifAnnulation?: string;

    anneeScolaire?: string;
    cible?: string;
    datePublication?: string;
    dateDepublication?: string;

}