import { SetupMode } from "../response/setup-mode.model";

export interface SetupProcessStartRequest {

  setupMode: SetupMode;

  tenantUuid: string;

  organizationUuid: string;

  userUuid: string;

}