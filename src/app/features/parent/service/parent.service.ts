import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ParentList } from '../../../core/models/parent/parent-list';
import { ParentDetails } from '../../../core/models/parent/parent-details';

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

  constructor(private readonly http: HttpClient) { }

  getAllParents(): Observable<ParentList[]> {
    return this.http.get<ParentList[]>(`${this.baseUrl}/parent/list`, this.httpOptions);
  }

  getDetailsParent(id: number): Observable<ParentDetails> {
    return this.http.get<ParentDetails>(`${this.baseUrl}/parent/details/${id}`);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/parent/delete/${id}`);
  }
}
