import { OrganizationSpace } from "./organization-space.model";

export interface AccessibleOrganizationResponse {

  uuid: string;

  code: string;

  name: string;

  space: OrganizationSpace;

  principal: boolean;

  roles: string[];
}