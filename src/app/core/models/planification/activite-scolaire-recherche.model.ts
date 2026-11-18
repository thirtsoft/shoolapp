export interface ActiviteScolaireRechercheRequest {
    type?: TypeActiviteScolaire;
    etatId?: number;
    libelle?: string;
    anneeScolaireId?: number;
}

export enum TypeActiviteScolaire {
    EVENEMENT = 'EVENEMENT',
    REUNION = 'REUNION'
}

