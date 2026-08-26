import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SignInRequest } from '../../../../core/models/auth/sign-in-request';
import { SignInV2Response } from '../../../../core/models/auth/multitenantV2/sign-in-v2-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationV2Service {

  private readonly apiServer = environment.apiBaseUrl;
  private readonly adminUrl = '/api/v1/auth';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly httpClient: HttpClient) { }

  signIn(request: SignInRequest): Observable<SignInV2Response> {

    return this.httpClient.post<SignInV2Response>(
      `${this.apiServer}/api/auth/login`,
      request

    );
  }

}