export interface RoleUpdateRequest {
  code?: string;
  libelle?: string;
  description?: string;
  permissionUids?: string[];
}
