import { Parent } from "../../parent/parent";
import { UtilisateurRequest } from "../../request/utilisateur-request";
import { Eleve } from "./eleve";


export interface EleveRequest {
    id?: number;

    eleveDTO?: Eleve;

    parentDTOS?: Parent[];

    utilisateurDTORequests?: UtilisateurRequest;
}

export interface EleveRequeste {
    id?: number;

    eleveDTO?: Eleve;

    parentDTOs?: Parent[];

    utilisateurDTOS?: UtilisateurRequest[];
}