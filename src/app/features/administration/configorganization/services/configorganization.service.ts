import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OrganizationResponse } from '../../../../core/models/onboarding/organization/organization-response';
import { OrganizationRequest } from '../../../../core/models/organization/organization-request.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigOrganizationService {

  baseUrl_1 = environment.apiBaseUrl;
  organizationUrl = this.baseUrl_1 + '/platform/organizations';
  securityUrl = this.baseUrl_1 + '/api/security';


  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getOrganizationInfos(organizationUuid: string): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(this.organizationUrl + `/${organizationUuid}`, this.httpOptions);
  }

  updateOranizationInfo(organizationUuid: string, value: OrganizationRequest): Observable<OrganizationResponse> {
    return this.http.put<OrganizationResponse>(`${this.organizationUrl}/${organizationUuid}`, value);
  }

  /*

  createUtilisateur(info: Utilisateur) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/utilisateur/users-internal`, info);
  }

  updateUtilisateurPlatform(userUuid: string, value: UserUpdateRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.userUrl}/platform/${userUuid}`, value);
  }



  updateUserIdentification(userUuid: string, value: ForgotPassword): Observable<ForgotPassword> {
    return this.http.put<ForgotPassword>(`${this.securityUrl}/${userUuid}/changeidentifier`, value);
  }

  updateParent(id: number, value: Utilisateur) {
    return this.http.patch<ResponseMessage>(`${this.baseUrl_1}/utilisateur/parent/edit/${id}`, value);
  }

  activatedAccount(userId: number) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/utilisateur/activated/${userId}`, {});
  }

  deactivatedAccount(userId: number) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/utilisateur/deactivated/${userId}`, {});
  }

  deleteUtilisateur(id?: number): Observable<any> {
    return this.http.delete(`${this.baseUrl_1}/utilisateur/delete/${id}`);
  }

  updatePassword(userId: number, creds: UtilisateurCredentials) {
    return this.http.put<ResponseMessage>(`${this.baseUrl_1}/utilisateur/${userId}/credentials`, creds, this.httpOptions);
  }

  createOrEditEcoleAdmin(info: Utilisateur) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/ecole/saveedit`, info);
  }

  getEcoleAdminById(id: number, value: Utilisateur) {
    return this.http.put<ResponseMessage>(`${this.baseUrl_1}/ecole/${id}`, value);
  }
  */

}