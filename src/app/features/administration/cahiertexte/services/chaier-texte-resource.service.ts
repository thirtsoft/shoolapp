import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DataResult } from '../../../../core/datamodel/data-model';
import { CahiersDeTexteseResponse } from '../../../../core/models/cahier-texte/cahiers-textes-response.model';
import { EntreeCahierTexteRequest } from '../../../../core/models/cahier-texte/entrees-cahier-texte-request.model';
import { EntreeCahierTextePageResponse } from '../../../../core/models/cahier-texte/entrees-cahiers-texte-page-response.model';
import { EntreeCahierTexteResponse } from '../../../../core/models/cahier-texte/entrees-cahiers-textes-responses.model';
import { FaireAppelRequest } from '../../../../core/models/dossiereleve/absence/faire-appel-request';
import { ResponseMessage } from '../../../../core/response/response-message';
import { CahierDeTexteDetailsResponse } from '../../../../core/models/cahier-texte/cahier-texte-details-response.model';
import { CahierDeTexteResponse } from '../../../../core/models/cahier-texte/cahier-texte-response.model';

@Injectable({
  providedIn: 'root'
})
export class CahierTexteResourceService {

  baseUrl_1 = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getCahierTexteByClasseAndAnneeScolaire(classeUuid: string, anneeScolaireUuid: string): Observable<CahiersDeTexteseResponse> {
    return this.http.get<CahiersDeTexteseResponse>(
      `${this.baseUrl_1}/cahier-texte/classe/${classeUuid}/annee-scolaire/${anneeScolaireUuid}`
    );
  }

  getDetailsCahierTexte(cahierTexteId: number, dateDebut: string, dateFin: string, page: number = 0, size: number = 100): Observable<CahierDeTexteDetailsResponse> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<CahierDeTexteDetailsResponse>(`${this.baseUrl_1}/cahier-texte/${cahierTexteId}/details`, { params });
  }

  getEntreeCahierTexteByCahierText(cahierTexteId: number, dateDebut: string, dateFin: string, page: number = 0, size: number = 20): Observable<EntreeCahierTextePageResponse> {
    let params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<EntreeCahierTextePageResponse>(
      `${this.baseUrl_1}/cahier-texte/${cahierTexteId}/entrees`,
      { params }
    );
  }

  publierCahierDeTexte(cahierTexteId: number): Observable<CahierDeTexteResponse> {
    return this.http.patch<any>(`${this.baseUrl_1}/cahier-texte/${cahierTexteId}/publier`, {});
  }

  dePublierCahierDeTexte(cahierTexteId: number): Observable<CahierDeTexteResponse> {
    return this.http.patch<any>(`${this.baseUrl_1}/cahier-texte/${cahierTexteId}/depublier`, {});
  }

  cloturerCahierDeTexte(cahierTexteId: number): Observable<CahierDeTexteResponse> {
    return this.http.patch<any>(`${this.baseUrl_1}/cahier-texte/${cahierTexteId}/cloturer`, {});
  }

  createEntree(request: EntreeCahierTexteRequest): Observable<EntreeCahierTexteResponse> {
    return this.http.post<EntreeCahierTexteResponse>(
      `${this.baseUrl_1}/cahier-texte/entrees`,
      request
    );
  }

  updateEntree(id: number, request: EntreeCahierTexteRequest): Observable<EntreeCahierTexteResponse> {
    return this.http.put<EntreeCahierTexteResponse>(
      `${this.baseUrl_1}/cahier-texte/entrees/${id}`,
      request
    );
  }

  deleteEntree(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl_1}/cahier-texte/entrees/${id}`);
  }

  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.baseUrl_1}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
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

  createEditRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.baseUrl_1}/${endpoint}`;
    return this.http.post<DataResult<T>>(url, resource);
  }


  updateUneReource(endpoint: string, id: number, value: any) {
    const url = `${this.baseUrl_1}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, value);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.baseUrl_1}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  remplirCahierTexte(request: FaireAppelRequest): Observable<any> {
    const url = `${this.baseUrl_1}/attendancerecord/enseignant/faire-appel`;
    return this.http.post<any>(url, request);
  }


}
