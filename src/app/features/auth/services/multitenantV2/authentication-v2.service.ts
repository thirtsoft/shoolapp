import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SignInV2Response } from '../../../../core/models/auth/multitenantV2/sign-in-v2-response.model';
import { SignInRequest } from '../../../../core/models/auth/sign-in-request';
import { ChangePassword } from '../../../../core/models/utilisateur/change-password.model';
import { ForgotPasswordResponse } from '../../../../core/models/utilisateur/forgot-password-response.model';
import { ForgotPassword } from '../../../../core/models/utilisateur/forgot-password.model';
import { SecurityCredentialResponse } from '../../../../core/models/utilisateur/security-credential-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationV2Service {

  private readonly apiServer = environment.apiBaseUrl;
  private readonly securityUrl = this.apiServer + '/api/security';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  signIn(request: SignInRequest): Observable<SignInV2Response> {
    return this.http.post<SignInV2Response>(
      `${this.apiServer}/api/auth/login`, request);
  }

  changePassword(userUuid: string, request: ChangePassword): Observable<void> {
    return this.http.put<void>(`${this.securityUrl}/${userUuid}/changepassword`, request);
  }

  forgotPassword(request: ForgotPassword): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiServer}/api/auth/forgot-password`, request);
  }

  getInfoConnexion(userUuid: string): Observable<SecurityCredentialResponse> {
    return this.http.get<SecurityCredentialResponse>(`${this.securityUrl}/${userUuid}/identifier`);
  }

  changeIdentifiant(userUuid: string, request: ForgotPassword): Observable<SecurityCredentialResponse> {
    return this.http.put<SecurityCredentialResponse>(`${this.securityUrl}/${userUuid}/changeidentifier`, request);
  }

}