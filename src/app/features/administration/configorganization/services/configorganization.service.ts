import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { NotificationConfigurationResponse } from '../../../../core/models/notification/notification-configuration-response';
import { NotificationConfigurationUpdateRequest } from '../../../../core/models/notification/notification-configuration-update-request';
import { OrganizationGetConfigInformationResponse } from '../../../../core/models/onboarding/organization/organization-get-config-information-response';
import { OrganizationResponse } from '../../../../core/models/onboarding/organization/organization-response';
import { OrganizationUpdateConfigInformationRequest } from '../../../../core/models/onboarding/organization/organization-update-config-information-request';
import { UpdateLogoOrganizationResponse } from '../../../../core/models/onboarding/organization/update-logo-organization-response';
import { OrganizationRequest } from '../../../../core/models/organization/organization-request.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigOrganizationService {

  baseUrl_1 = environment.apiBaseUrl;
  organizationUrl = this.baseUrl_1 + '/platform/organizations';
  securityUrl = this.baseUrl_1 + '/api/security';
  notificationConfigurationUrl = this.baseUrl_1 + '/api/v1/notifications';
  photoUrl = this.baseUrl_1 + '/v1/storage';


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
    return this.http.patch<OrganizationResponse>(`${this.organizationUrl}/${organizationUuid}`, value);
  }

  modifierInfo(organizationUuid: string, request: OrganizationUpdateConfigInformationRequest): Observable<ApiResponse<OrganizationGetConfigInformationResponse>> {
    return this.http.patch<ApiResponse<OrganizationGetConfigInformationResponse>>(
      `${this.organizationUrl}/edit/${organizationUuid}`,
      request
    );
  }

  modifierLogo(organizationUuid: string, file: File): Observable<ApiResponse<UpdateLogoOrganizationResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ApiResponse<UpdateLogoOrganizationResponse>>(
      `${this.organizationUrl}/${organizationUuid}/logo`,
      formData
    );
  }

  getLogoContent(fileStorageUuid: string): Observable<Blob> {
    return this.http.get(
      `${this.photoUrl}/content/${fileStorageUuid}`,
      {
        responseType: 'blob'
      }
    );
  }

  getNotificationConfiguration(configUuid: string): Observable<ApiResponse<NotificationConfigurationResponse>> {
    return this.http.get<ApiResponse<NotificationConfigurationResponse>>(this.notificationConfigurationUrl + `/configurations/${configUuid}`, this.httpOptions);
  }

  getNotificationConfigurationByTenantUuid(tenantUuid: string): Observable<ApiResponse<NotificationConfigurationResponse>> {
    return this.http.get<ApiResponse<NotificationConfigurationResponse>>(this.notificationConfigurationUrl + `/configurations/tenant/${tenantUuid}`, this.httpOptions);
  }

  saveOrUpdateNotificationConfiguration(tenantUuid: string, value: NotificationConfigurationUpdateRequest): Observable<ApiResponse<NotificationConfigurationResponse>> {
    return this.http.post<ApiResponse<NotificationConfigurationResponse>>(`${this.notificationConfigurationUrl}/configurations/${tenantUuid}`, value);
  }

  createDefaultNotificationConfiguration(value: NotificationConfigurationUpdateRequest): Observable<void> {
    return this.http.post<void>(`${this.notificationConfigurationUrl}/configurations/default`, value);
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