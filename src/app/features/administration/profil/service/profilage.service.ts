import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Action } from '../../../../core/models/profil/action';
import { Profil } from '../../../../core/models/profil/profil';
import { TypeCompte } from '../../../../core/models/profil/typecompte';
import { ResponseMessage } from '../../../../core/response/response-message';
import { PermissionGroupResponse } from '../../../../core/models/permission/permission-group-response.model';
import { RoleCreateResponse } from '../../../../core/models/role/role-create-response.model';
import { RoleCreateRequest } from '../../../../core/models/role/role-create-request.model';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { RoleResponse } from '../../../../core/models/role/role-response.model';
import { RoleUpdateRequest } from '../../../../core/models/role/role-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilageService {

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

  getAllActions(): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.baseUrl_1}/profilage/action/list`);
  }

  getAllActionsByTypeCompte(typeCompteId: number): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.baseUrl_1}/profilage/action/typecompte/${typeCompteId}`);
  }

  getAction(id: number): Observable<Action> {
    return this.http.get<Action>(`${this.baseUrl_1}/profilage/action/${id}`);
  }

  createAction(info: Action) {
    return this.http.post<void>(`${this.baseUrl_1}/profilage/action/save`, info);
  }

  updateAction(id: number, value: Action) {
    return this.http.put<void>(`${this.baseUrl_1}/profilage/action/edit/${id}`, value);
  }

  deleteAction(id?: number): Observable<any> {
    return this.http.delete(`${this.baseUrl_1}/profilage/action/delete/${id}`);
  }

  /**************   Profil *****************/

  getAllProfils(): Observable<Profil[]> {
    return this.http.get<Profil[]>(`${this.baseUrl_1}/profilage/profile`);
  }

  getProfilesAgents(): Observable<Profil[]> {
    return this.http.get<Profil[]>(`${this.baseUrl_1}/profilage/profile/list`);
  }

  getProfil(id: number): Observable<Profil> {
    return this.http.get<Profil>(`${this.baseUrl_1}/profilage/profile/${id}`);
  }

  createProfil(info: Profil) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/profilage/profile/save`, info);
  }

  updateProfil(id: number, value: Profil) {
    return this.http.put<ResponseMessage>(`${this.baseUrl_1}/profilage/profile/edit/${id}`, value);
  }

  deleteProfil(id?: number): Observable<any> {
    return this.http.delete<ResponseMessage>(`${this.baseUrl_1}/profilage/profile/delete/${id}`);
  }

  getTypeCompte(id: number): Observable<TypeCompte> {
    return this.http.get<TypeCompte>(`${this.baseUrl_1}/typecompte/${id}`);
  }

  getLesTypeComptes(): Observable<TypeCompte[]> {
    return this.http.get<TypeCompte[]>(`${this.baseUrl_1}/typecompte/list`);
  }



}
