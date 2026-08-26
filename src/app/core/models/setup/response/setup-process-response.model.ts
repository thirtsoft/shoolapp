import { SetupEtablissementRequest } from "../request/setup-etablissement-request.model";
import { SetupAnneeScolaireResponse } from "./setup-annee-scolaire-response.model";
import { SetupClassesResponse } from "./setup-classes-response.model";
import { SetupMatieresResponse } from "./setup-matieres-response.model";
import { SetupPeriodeScolaireResponse } from "./setup-periode-scolaire-response.model";
import { SetupSemestreResponse } from "./setup-semestre-response.model";
import { SetupStructurePedagogiqueResponse } from "./setup-sructure-pedagogique-response.model";

export interface SetupProcessResponse {

  setupUuid: string;

  workflowCode: string;

  tenantUuid: string;

  userUuid: string;

  organizationUuid: string;

  anneeScolaireUid: number;

  semestreUid: number;

  sessionSemestreUid: number;

  status: string;

  currentStep: string;

  message: string;

  structurePedagogique: SetupStructurePedagogiqueResponse;

  classes: SetupClassesResponse;

  periodesScolaires: SetupPeriodeScolaireResponse;

  matieres: SetupMatieresResponse;

  //
  etablissement: SetupEtablissementRequest;

  /**
   * Année scolaire configurée.
   */
  anneeScolaire: SetupAnneeScolaireResponse;

  /**
   * Semestres configurés.
   */
  semestres: SetupSemestreResponse[];


}