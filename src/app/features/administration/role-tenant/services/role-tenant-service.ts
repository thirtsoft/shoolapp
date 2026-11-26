import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { PermissionGroupResponse } from '../../../../core/models/permission/permission-group-response.model';

import { RoleCreateResponse } from '../../../../core/models/role/role-create-response.model';
import { RoleCreateRequest } from '../../../../core/models/role/role-create-request.model';

import { RoleResponse } from '../../../../core/models/role/role-response.model';
import { RoleUpdateRequest } from '../../../../core/models/role/role-update-request.model';

import { RolesResponse } from '../../../../core/models/role/roles-response.model';

@Injectable({
  providedIn: 'root'
})
export class RoleTenantService {

  private readonly baseUrl = environment.apiBaseUrl;

  private readonly permissionUrl =
    `${this.baseUrl}/api/security/permissions`;

  private readonly roleUrl =
    `${this.baseUrl}/api/platform/security/roles`;

  constructor(
    private readonly http: HttpClient
  ) { }

  /**
   * Liste des permissions regroupées par module.
   */
  getAllPermissions(): Observable<PermissionGroupResponse[]> {
    return this.http.get<PermissionGroupResponse[]>(
      `${this.permissionUrl}/grouped`
    );
  }

  /**
   * Récupération d'un rôle par UUID.
   */
  getRoleByUuid(roleUuid: string): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(
      `${this.roleUrl}/${roleUuid}`
    );
  }


  getAssignableRoles(): Observable<RolesResponse[]> {
    return this.http.get<RolesResponse[]>(`${this.roleUrl}`);
  }

  createRole(info: RoleCreateRequest): Observable<RoleCreateResponse> {
    return this.http.post<RoleCreateResponse>(`${this.roleUrl}`, info);
  }

  updateRole(roleUuid: string, value: RoleUpdateRequest): Observable<RoleCreateResponse> {
    return this.http.put<RoleCreateResponse>(`${this.roleUrl}/${roleUuid}`, value);
  }
}