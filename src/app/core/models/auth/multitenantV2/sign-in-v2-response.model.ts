import { AccessibleOrganizationResponse } from "./accessible-organization-response.model";
import { UserV2Response } from "./user-v2-response.model";

export interface SignInV2Response {

  authenticated: boolean;

  tenantUuid: string;

  accessToken: string;

  refreshToken: string | null;

  expiresAt: string | null;

  user: UserV2Response;

  currentOrganizationUuid: string | null;

  accessibleOrganizations: AccessibleOrganizationResponse[];

  temporaryToken: string | null;
}