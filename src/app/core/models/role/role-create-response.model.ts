export interface RoleCreateResponse {
  uuid?: string;
  code?: string;
  libelle?: string;
  description?: string;
  roleType?: string;
  roleScope?: string;
  builtIn?: boolean;
  assignable?: boolean;
  ordre?: number;
  permissionUuids?: string[];
}
