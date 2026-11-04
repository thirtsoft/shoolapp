import { EntreeFicheEmargementResponse } from "./entree-fiche-emargement-response.model";

export interface FicheEmargementDetailResponseResponse {
    ficheUuid: string;
    numeroFiche: string;
    enseignantUuid: string;
    enseignantMatricule: string;
    enseignantPrenom: string;
    enseignantNom: string;
    mois: number;
    annee: number;
    moisLibelle: string;
    anneeScolaireUuid: string;
    anneeScolaireLibelle: string;
    etatUuid: string;
    etatCode: string;
    etatLibelle: string;

    nombreSeancesPrevues: number;
    nombreSeancesEffectuees: number;
    nombreSeancesNonEffectuees: number;
    nombreSeancesAnnulees: number;

    dateCreation: string;
    dateSoumission?: string | null;
    dateValidation?: string | null;

    entrees: EntreeFicheEmargementResponse[];
}



