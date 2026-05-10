import { AnneeScolaire } from "../referentiels/annee-scolaire";
import { Classe } from "../referentiels/classe";
import { Eleve } from "./request/eleve";


export interface DetailsInscription {
    id?: number;

    code?: string;

    eleveDTO?: Eleve;

    anneeScolaireDTODebut?: AnneeScolaire;

    anneeScolaireDTOFin?: AnneeScolaire;

    classeDTO?: Classe;

    montantInscription?: number;

    dateInscription?: Date;

    createdBy?: number;
}