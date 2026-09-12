import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PermissionGroupResponse } from '../../../../core/models/permission/permission-group-response.model';
import { RoleCreateResponse } from '../../../../core/models/role/role-create-response.model';
import { RoleCreateRequest } from '../../../../core/models/role/role-create-request.model';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { RoleResponse } from '../../../../core/models/role/role-response.model';
import { RoleUpdateRequest } from '../../../../core/models/role/role-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class RoleTenantService {

  baseUrl_1 = environment.apiBaseUrl;
  permissionUrl = this.baseUrl_1 + '/api/security/permissions';
  roleUrl = this.baseUrl_1 + '/api/platform/security/roles';

  constructor(private readonly http: HttpClient) { }

  getAllPermissions(): Observable<PermissionGroupResponse[]> {
    return this.http.get<PermissionGroupResponse[]>(`${this.permissionUrl}/grouped`);
  }

  getPermissionByUuid(): Observable<ApiResponse<RoleResponse>> {
    return this.http.get<ApiResponse<RoleResponse>>(`${this.permissionUrl}/grouped`);
  }

  createRole(info: RoleCreateRequest): Observable<RoleCreateResponse> {
    return this.http.post<RoleCreateResponse>(`${this.roleUrl}`, info);
  }

  updateRole(roleUuid: string, value: RoleUpdateRequest): Observable<RoleCreateResponse> {
    return this.http.put<RoleCreateResponse>(`${this.roleUrl}/profilage/action/edit/${roleUuid}`, value);
  }

}
