import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DataResult } from '../../../../core/datamodel/data-model';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class ReferentielResourceService {

  baseUrl_1 = environment.apiBaseUrl;
  referentielUrl = this.baseUrl_1 + '/referentiel';
  livreUrl = this.baseUrl_1 + '/livre';
  referentielBaseUrl = this.baseUrl_1 + '/base';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }


  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.referentielUrl}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourceListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.referentielUrl}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.referentielUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.baseUrl_1}/${endpoint}`;

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

  recupererUneResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.referentielUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  creerUneRessource<T>(endpoint: string, resource: T) {
    const url = `${this.referentielUrl}/${endpoint}/save`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  modifierUneRessource<T>(endpoint: string, id: number, resource: T) {
    const url = `${this.referentielUrl}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }

  supprimerUneResource<T>(endpoint: string, id: number) {
    const url = `${this.referentielUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  /**************   Livre    ***** ******/

  getLivreList<T>(endpoint: string): Observable<T> {
    const url = `${this.livreUrl}/${endpoint}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getLivrePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.livreUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getLivre<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.livreUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  createLivre<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.livreUrl}/${endpoint}/save`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }

  updateLivre<T>(endpoint: string, id: number, resource: Partial<T>): Observable<T> {
    const url = `${this.livreUrl}/${endpoint}/update/${id}`;
    return this.http.put<T>(url, resource, this.httpOptions);
  }

  deleteLivre<T>(endpoint: string, id: number) {
    const url = `${this.livreUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  getResourceBaseList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.referentielBaseUrl}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourceBaseListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.referentielBaseUrl}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

}
