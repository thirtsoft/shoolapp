import { SetupNiveauRequest } from "./setup-niveau-request.model";

export interface SetupCycleRequest {

  code: string;

  libelle: string;

  niveaux: SetupNiveauRequest[];


}