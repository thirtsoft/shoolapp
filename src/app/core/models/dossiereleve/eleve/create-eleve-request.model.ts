import { MedecinTraitant } from "../request/medecin-traitant";
import { CreateEleveParentRequest } from "./create-eleve-parent-request.model";

export interface CreateEleveRequest {

  nom?: string;
  prenom?: string;
  sexe?: string;
  lieuNaissance?: string;
  address?: string;
  nationalite?: string;
  dateNaissance?: Date;
  allergies?: string[];

  medecinTraitantDTO?: MedecinTraitant;


  parents?: CreateEleveParentRequest[];


}