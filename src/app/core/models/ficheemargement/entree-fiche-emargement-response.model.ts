export interface EntreeFicheEmargementResponse {
    uuid: string;
    coursUuid: string;
    coursLibelle?: string | null;
    dateCours: string;
    dateReelleEffectuee?: string | null;
    heureDebutPrevue?: string | null;
    heureFinPrevue?: string | null;
    heureDebutReelle?: string | null;
    heureFinReelle?: string | null;
    statutSeance: StatutSeanceEmargement;
    observation?: string | null;
}


export type StatutSeanceEmargement =
    | 'SEANCE_PLANIFIEE'
    | 'SEANCE_EFFECTUEE'
    | 'SEANCE_NON_EFFECTUEE'
    | 'SEANCE_ANNULEE';