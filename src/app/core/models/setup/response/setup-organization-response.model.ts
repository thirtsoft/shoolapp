import { SetupMode } from "./setup-mode.model";
import { SetupStatus } from "./setup-status.model";
import { SetupStep } from "./setup-step.model";

export interface SetupOrganizationResponse {

  setupUuid: string;

  workflowCode: string;

  setupMode: SetupMode;

  status: SetupStatus;

  currentStep: SetupStep;

  tenantUuid: string;

  organizationUuid: string;

  userUuid: string;

  anneeScolaireUid: number | null;

  anneeScolaireDateDebut: string | null;

  anneeScolaireDateFin: string | null;

  periodicite: string | null;

  semestreUid: number | null;

  sessionSemestreUid: number | null;

  startedAt: string | null;

  lastActivityAt: string | null;

  completedAt: string | null;

  errorMessage: string | null;

}