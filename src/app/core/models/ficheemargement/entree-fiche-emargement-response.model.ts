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
    statutSeance: string;
    observation?: string | null;
}