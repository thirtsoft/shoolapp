import { PermissionAction } from "./permission-action.model";

export interface PermissionResponse {
  uuid: string;
  code: string;
  libelle: string;
  description: string;
  permissionAction: PermissionAction;
  ordre: number;
}
