import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DataResult } from '../../../../core/datamodel/data-model';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurResourceService {

  utilisateurUrl = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  getResourceList<T>(endpoint: string): Observable<T> {
    const url = `${this.utilisateurUrl}/${endpoint}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.utilisateurUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.utilisateurUrl}/${endpoint}`;

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
    const url = `${this.utilisateurUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.utilisateurUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  createRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.utilisateurUrl}/${endpoint}/save`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }

  createOrEditRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.utilisateurUrl}/${endpoint}/saveedit`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }


  updateResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<T> {
    const url = `${this.utilisateurUrl}/${endpoint}/update/${id}`;
    return this.http.put<T>(url, resource, this.httpOptions);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.utilisateurUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }
}
