import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Utilisateur } from '../../../../core/models/utilisateur/utilisateur';
import { UtilisateurCredentials } from '../../../../core/models/utilisateur/utilisateur-credential';
import { UtilisateurList } from '../../../../core/models/utilisateur/utilisateur-list';
import { ResponseMessage } from '../../../../core/response/response-message';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { UserResponse } from '../../../../core/models/utilisateur/user-response.model';
import { UserUpdateRequest } from '../../../../core/models/utilisateur/update-user-request.model';
import { ForgotPassword } from '../../../../core/models/utilisateur/forgot-password.model';
import { UserCreateResponse } from '../../../../core/models/utilisateur/user-creation-response.model';
import { UserCreationRequest } from '../../../../core/models/utilisateur/user-creation-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  /*   baseUrl_1 = environment.apiBaseUrl;
    userUrl = this.baseUrl_1 + '/api/users';
    securityUrl = this.baseUrl_1 + '/api/security'; */

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly userUrl = `${this.baseUrl}/api/users`;
  private readonly securityUrl = `${this.baseUrl}/api/security`;


  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getUser(userUuid: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userUrl}/${userUuid}`);
  }

  createUser(info: UserCreationRequest): Observable<UserCreateResponse> {
    return this.http.post<UserCreateResponse>(`${this.userUrl}`, info);
  }

  updateUser(userUuid: string, value: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.userUrl}/${userUuid}`, value);
  }

  getUserProfil(userUuid: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(this.userUrl + `/${userUuid}`, this.httpOptions);
  }


  updateUtilisateurPlatform(userUuid: string, value: UserUpdateRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.userUrl}/platform/${userUuid}`, value);
  }

  updateUtilisateurTenant(userUuid: string, value: UserUpdateRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.userUrl}/tenant/${userUuid}`, value);
  }

  updateUserIdentification(userUuid: string, value: ForgotPassword): Observable<ForgotPassword> {
    return this.http.put<ForgotPassword>(`${this.securityUrl}/${userUuid}/changeidentifier`, value);
  }

}