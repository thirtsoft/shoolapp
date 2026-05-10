import { AnneeScolaire } from "../../referentiels/annee-scolaire";
import { Classe } from "../../referentiels/classe";
import { Eleve } from "./eleve";



export interface Inscription {
    id?: number;

    code?: string;

    eleveDTO?: Eleve;

    classeDTO?: Classe;

    anneeScolaireDTO?: AnneeScolaire;

    eleveId?: number;

    anneeScolaireId?: number;

    classeId?: number;

    montantInscription?: number;

    dateInscription?: Date;

    createdBy?: number;
}