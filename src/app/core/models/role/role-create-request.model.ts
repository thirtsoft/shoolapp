export interface RoleCreateRequest {
  code?: string;
  libelle?: string;
  description?: string;
  permissionUids?: string[];
}
