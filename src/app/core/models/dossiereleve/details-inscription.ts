import { AnneeScolaire } from "../referentiels/annee-scolaire";
import { GetEleveResponse } from "./eleve/get-eleve-response.model";



export interface DetailsInscription {
    id?: number;

    code?: string;

    reference?: string;

    getEleveResponse?: GetEleveResponse;

    anneeScolaireDTO?: AnneeScolaire;

    classe?: string;

    niveau?: string;

    serie?: string;

    etat?: string;

    moyenPaiement?: string;

    montantInscription?: number;

    montantRecu?: number;

    resteAPaye?: number;

    motifAnnulation?: string;

    dateInscription?: Date;

    actif?: number;
}