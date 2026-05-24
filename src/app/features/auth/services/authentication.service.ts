import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FirstSignInRequest } from '../../../core/models/auth/first-sign-in-request';
import { SignInRequest } from '../../../core/models/auth/sign-in-request';
import { SignInResponse } from '../../../core/models/auth/sign-in-response';
import { Utilisateur } from '../../../core/models/utilisateur/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly apiServer = environment.apiBaseUrl;
  private readonly adminUrl = '/api/v1/auth';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }
  constructor(private readonly httpClient: HttpClient) {
  }

  signIn(signInRequest: SignInRequest): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${this.apiServer}/auth/signin`, signInRequest);
  }

  getFirstSigninUser(token?: string): Observable<any> {
    return this.httpClient.get(`${this.apiServer}/utilisateur/activation/${token}`);
  }



  firstSignIn(firstSignInReq: FirstSignInRequest, isIfAdmin: boolean) {
    let url = this.apiServer + '/activation';
    if (!isIfAdmin) {
      url = this.adminUrl + `/users/activation`;
    }
  }

  getUser(userId: number): Observable<Utilisateur> {
    return this.httpClient.get<Utilisateur>(this.apiServer + `/utilisateur/${userId}`, this.httpOptions);
  }


  getListUtilisateurs(): Observable<Utilisateur[]> {
    return this.httpClient.get<Utilisateur[]>(this.apiServer + `/utilisateur/list`);
  }

}
