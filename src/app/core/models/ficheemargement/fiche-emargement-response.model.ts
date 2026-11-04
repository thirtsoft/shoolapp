import { EntreeFicheEmargementResponse } from "./entree-fiche-emargement-response.model";

export interface FicheEmargementResponse {
    uuid: string;
    numeroFiche: string;
    enseignantUuid: string;
    enseignantNom: string;
    anneeScolaireUuid: string;
    mois: number;
    annee: number;
    etatUuid: string;
    etatCode: string;
    etatLibelle: string;
    dateCreation: string;
    dateSoumission?: string | null;
    dateValidation?: string | null;
    validePar?: string | null;
    observation?: string | null;
    motifRetour?: string | null;
    dateRetour?: string | null;
    retournePar?: string | null;
    entrees: EntreeFicheEmargementResponse[];
}  