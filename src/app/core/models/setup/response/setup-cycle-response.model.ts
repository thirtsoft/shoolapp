import { SetupNiveauResponse } from "./setup-niveau-response.model";

export interface SetupCycleResponse {

  cycleId: number;
  code: string;
  libelle: string;

  niveaux: SetupNiveauResponse[];

}