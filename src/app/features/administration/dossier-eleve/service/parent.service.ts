import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ParentList } from '../../../../core/models/parent/parent-list';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { ResponseMessage } from '../../../../core/response/response-message';
import { Parent, ParentMini, ParentUtilisateurAddEdit } from '../../../../core/models/parent/parent';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  baseUrl = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getAllParents(): Observable<ParentList[]> {
    return this.http.get<ParentList[]>(`${this.baseUrl}/parent/list`, this.httpOptions);
  }

  getParent(id: number): Observable<ParentUtilisateurAddEdit> {
    return this.http.get<ParentUtilisateurAddEdit>(`${this.baseUrl}/parent/${id}`);
  }

  updateParent(id: number, value: ParentUtilisateurAddEdit): Observable<ParentMini> {
    return this.http.patch<ParentMini>(`${this.baseUrl}/parent/edit/${id}`, value);
  }

  getDetailsParent(id: number): Observable<ParentDetails> {
    return this.http.get<ParentDetails>(`${this.baseUrl}/parent/details/${id}`);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/parent/delete/${id}`);
  }

}
