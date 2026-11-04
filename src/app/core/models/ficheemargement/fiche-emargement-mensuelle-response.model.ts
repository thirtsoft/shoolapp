export interface FicheEmargementMensuelleResponse {
    ficheUuid: string;
    numeroFiche: string;
    enseignantUuid: string;
    enseignantMatricule: string;
    enseignantPrenom: string;
    enseignantNom: string;
    mois: number;
    annee: number;
    etatUuid: string;
    etatCode: string;
    etatLibelle: string;
    nombreSeancesPrevues: number;
    nombreSeancesEffectuees: number;
    nombreSeancesNonEffectuees: number;
    nombreSeancesAnnulees: number;
    dateSoumission?: string | null;
    dateValidation?: string | null;
}

export interface FichesEmargementMensuellesResponse {
    mois: number;
    annee: number;
    anneeScolaireUuid: string;
    nombreEnseignants: number;
    nombreFiches: number;
    nombreFichesValidees: number;
    nombreFichesEnCours: number;
    nombreFichesAControler: number;
    nombreFichesRetournees: number;
    fiches: FicheEmargementMensuelleResponse[];
}

