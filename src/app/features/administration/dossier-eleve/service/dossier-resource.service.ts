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
export class DossierResourceService {

  baseUrl_1 = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.baseUrl_1}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getInscriptionsFiltered(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      params = params.append(key, filters[key]);
    });
    return this.http.get<any>(`${this.baseUrl_1}/inscription/filtered/page`, { params });
  }

  getResourceListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.baseUrl_1}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);

  }

  getResourcesByIdPaged<T>(endpoint: string, id: number, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.baseUrl_1}/${endpoint}/${id}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.baseUrl_1}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getResourceFiltred(endpoint: string, page: number, size: number, filters: any): Observable<any> {
    if (!endpoint || !Number.isInteger(page) || !Number.isInteger(size)) {
      return throwError(() => new Error('Paramètres invalides'));
    }
    const cleanedFilters = this.cleanFilters(filters);

    const url = this.buildFilterUrl(endpoint, page, size, cleanedFilters);

    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Erreur de filtrage:', error);
        return throwError(() => new Error('Échec du filtrage'));
      })
    );
  }

  private cleanFilters(filters: any): any {
    if (!filters) return {};
    const result = { ...filters };
    Object.keys(result).forEach(key => {
      if (result[key] == null || result[key] === '') {
        delete result[key];
      }
    });
    return result;
  }

  private buildFilterUrl(endpoint: string, page: number, size: number, filters: any): string {
    const baseUrl = `${this.baseUrl_1}/${endpoint}/filtered/page`;
    const paginationParams = `page=${page}&size=${size}`;
    if (Object.keys(filters).length === 0) {
      return `${baseUrl}?${paginationParams}`;
    }
    try {
      const encodedFilters = encodeURIComponent(JSON.stringify(filters));
      return `${baseUrl}?${paginationParams}&filtre=${encodedFilters}`;
    } catch (e) {
      console.error('Erreur encodage filtres:', e);
      return `${baseUrl}?${paginationParams}`;
    }
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

  fetchFilterByElementDataTable<T>(endpoint: string, id: number, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.baseUrl_1}/${endpoint}/${id}`;

    if (filters) {
      const encodedFilters = encodeURIComponent(JSON.stringify(filters));
      url = `${url}/filtered/page?filtre=${encodedFilters}&page=${page}&size=${size}`;
    } else {
      url = `${url}?page=${page}&size=${size}`;
    }

    console.log('URL:', url); // Debug URL

    return this.http.get<DataResult<T>>(url, this.httpOptions).pipe(
      tap(response => console.log('Réponse API:', response)),
      catchError(error => {
        console.error('Erreur API:', error);
        return throwError(() => error);
      })
    );
  }

  getSingleResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.baseUrl_1}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.baseUrl_1}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  afficherDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.baseUrl_1}/${endpoint}/details/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  afficherListeEleveParClassEtAnneeScolaire<T>(endpoint: string, classId: number, anneeId: number): Observable<T[]> {
    const url = `${this.baseUrl_1}/${endpoint}/classe/${classId}/anneescolaire/${anneeId}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  createEditRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.baseUrl_1}/${endpoint}/saveedit`;
    return this.http.post<DataResult<T>>(url, resource);
  }


  ajouterEditResource(endpoint: string, resource: any) {
    const url = `${this.baseUrl_1}/${endpoint}/saveedit`;
    return this.http.post<ResponseMessage>(url, resource);
  }

  updateUneReource(endpoint: string, id: number, value: any) {
    const url = `${this.baseUrl_1}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, value);
  }


  createRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.baseUrl_1}/${endpoint}/save`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }

  genererBulletinEleveResource<T>(endpoint: string, eleveId: number, semestre: number, annee: number) {
    const url = `${this.baseUrl_1}/${endpoint}/eleve/${eleveId}/semestre/${semestre}/annee/${annee}`;
    return this.http.post<ResponseMessage>(url, this.httpOptions);
  }

  genererUneResource<T>(endpoint: string, classeId: number, semestre: number, annee: number) {
    const url = `${this.baseUrl_1}/${endpoint}/generer/classe/${classeId}/semestre/${semestre}/annee/${annee}`;
    return this.http.post<ResponseMessage>(url, this.httpOptions);
  }

  updateResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<T> {
    const url = `${this.baseUrl_1}/${endpoint}/update/${id}`;
    return this.http.put<T>(url, resource, this.httpOptions);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.baseUrl_1}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }
}
