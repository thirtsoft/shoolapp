import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Action } from '../../../../core/models/profil/action';
import { Profil } from '../../../../core/models/profil/profil';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class ProfilageService {

  baseUrl_1 = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) { }

  getAllActions(): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.baseUrl_1}/profilage/action/list`);
  }

  getAllActionsByTypeCompte(typeCompte: string): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.baseUrl_1}/profilage/action/typecompte/${typeCompte}`);
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
}
