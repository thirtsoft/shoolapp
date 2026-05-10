import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Utilisateur } from '../../../../core/models/utilisateur/utilisateur';
import { UtilisateurCredentials } from '../../../../core/models/utilisateur/utilisateur-credential';
import { UtilisateurList } from '../../../../core/models/utilisateur/utilisateur-list';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  baseUrl_1 = environment.apiBaseUrl;
  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getAllUtilisateurs(): Observable<UtilisateurList[]> {
    return this.http.get<UtilisateurList[]>(`${this.baseUrl_1}/utilisateur/list`);
  }

  getUtilisateur(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl_1}/utilisateur/${id}`);
  }

  getUtilisateurProfil(userId: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(this.baseUrl_1 + `/utilisateur/monprofil/${userId}`, this.httpOptions);
  }

  createUtilisateur(info: Utilisateur) {
    return this.http.post<ResponseMessage>(`${this.baseUrl_1}/utilisateur/users-internal`, info);
  }

  updateUtilisateur(id: number, value: Utilisateur) {
    return this.http.put<ResponseMessage>(`${this.baseUrl_1}/utilisateur/edit/${id}`, value);
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

}