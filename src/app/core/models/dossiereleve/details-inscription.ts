import { AnneeScolaire } from "../referentiels/annee-scolaire";
import { Classe } from "../referentiels/classe";
import { Eleve } from "./request/eleve";


export interface DetailsInscription {
    id?: number;

    code?: string;

    reference?: string;

    eleveDTO?: Eleve;

    anneeScolaireDTO?: AnneeScolaire;

    classeDTO?: Classe;

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

    createdBy?: number;

    actif?: number;
}