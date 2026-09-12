import { PermissionResponse } from "./permission-response.model";

export interface PermissionGroupResponse {
  moduleUid: string;
  moduleCode: string;
  moduleLibelle: string;
  moduleIcon: string;
  moduleOrdre: string;
  permissions: PermissionResponse[];
}
