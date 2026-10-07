import { CompteUtilisateurCreationResponse } from "./compte-utilisateur-creation-response.model";
import { PersonnelResponse } from "./personnel-response.model";

export interface PersonnelCreateResponse {

  personnel: PersonnelResponse;

  compteUtilisateur?: CompteUtilisateurCreationResponse;

}