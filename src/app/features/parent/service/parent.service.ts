import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ParentList } from '../../../core/models/parent/parent-list';
import { ParentDetails } from '../../../core/models/parent/parent-details';
import { ParentElevesResponse } from '../../../core/models/parent/parent-eleves-response.model';
import { DataResult } from '../../../core/datamodel/data-model';
import { ResponseMessage } from '../../../core/response/response-message';

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

  getResourceList<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getDetailsParent(id: number): Observable<ParentDetails> {
    return this.http.get<ParentDetails>(`${this.baseUrl}/parent/details/${id}`);
  }

  getMesElevest(): Observable<ParentElevesResponse> {
    return this.http.get<ParentElevesResponse>(`${this.baseUrl}/parent/me/eleves`);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/parent/delete/${id}`);
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.baseUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.baseUrl}/${endpoint}`;

    if (filters) {
      const encodedFilters = encodeURIComponent(JSON.stringify(filters));
      url = `${url}/filtered/page?filtre=${encodedFilters}&page=${page}&size=${size}`;
    } else {
      url = `${url}?page=${page}&size=${size}`;
    }

    return this.http.get<DataResult<T>>(url, this.httpOptions).pipe(
      tap(response => console.log('Réponse API:', response)),
      catchError(error => {
        console.error('Erreur API:', error);
        return throwError(() => error);
      })
    );
  }

  getSingleResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  createRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.baseUrl}/${endpoint}/save`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }

  createOrEditRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.baseUrl}/${endpoint}/saveedit`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }


  updateResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}/update/${id}`;
    return this.http.put<T>(url, resource, this.httpOptions);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.baseUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }


}
