import { Eleve } from "../../dossiereleve/request/eleve";

export interface ResponseMessage {
    statut?: string;
    message?: string;
}


export interface ResponseEleve {
    statut?: string;
    message?: string;
    eleve: number
}

