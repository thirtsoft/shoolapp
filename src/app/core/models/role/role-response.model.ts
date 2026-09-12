import { RoleType } from "./role-scope.model";
import { RoleScope } from "./role-type.model";

export interface RoleResponse {
  uuid?: string;
  tenantUuid?: string;
  code?: string;
  libelle?: string;
  description?: string;
  icon?: string;
  roleType?: RoleType;
  roleScope?: RoleScope;
  builtIn?: boolean;
  assignable?: boolean;
  ordre?: number;
  permissionUuids?: string[];

}
