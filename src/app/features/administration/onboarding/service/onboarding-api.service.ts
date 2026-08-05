import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { DataResult } from '../../../../core/datamodel/data-model';
import { OnboardingRequestModel } from '../../../../core/models/onboarding/onboarding-request.model';
import { OnboardingResponseModel } from '../../../../core/models/onboarding/onboarding-response.model';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class OnboardingApiService {

  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  baseUrl_1 = environment.apiBaseUrl;
  comptabiliteUrl = this.baseUrl_1 + '/comptabilite';

  private readonly onboardingUrl = this.baseUrl_1 + '/api/v1/onboarding';
    private readonly onboardingProcessUrl = this.baseUrl_1 + '/api/v1';
  private readonly tenantUrl = this.baseUrl_1 + '/api/platform';

  start(request: OnboardingRequestModel): Observable<ApiResponse<OnboardingResponseModel>> {

    return this.http.post<ApiResponse<OnboardingResponseModel>>(
      this.onboardingUrl,
      request
    );

  }

  getOnboardingProcessTenantResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.onboardingProcessUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterOnboardingProcessDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.onboardingProcessUrl}/${endpoint}`;

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


  getTenantResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.tenantUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }


  fetchFilterTenantDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.tenantUrl}/${endpoint}`;

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

  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.comptabiliteUrl}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourceListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.comptabiliteUrl}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourceByIdPaged<T>(endpoint: string, id: number, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.comptabiliteUrl}/${endpoint}/${id}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
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


  recupererUneResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.comptabiliteUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  afficherDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.comptabiliteUrl}/${endpoint}/details/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }


  creerUneRessource<T>(endpoint: string, resource: T) {
    const url = `${this.comptabiliteUrl}/${endpoint}/save`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  generersUneResource<T>(endpoint: string, classeId: number) {
    const url = `${this.comptabiliteUrl}/${endpoint}/generer/${classeId}`;
    return this.http.post<ResponseMessage>(url, this.httpOptions);
  }

  genererUneResource<T>(endpoint: string, classeId: number, mois: number, annee: number) {
    const url = `${this.comptabiliteUrl}/${endpoint}/generer/${classeId}/mois/${mois}/annee/${annee}`;
    return this.http.post<ResponseMessage>(url, this.httpOptions);
  }

  genererUneResourceClasse<T>(endpoint: string, resource: T) {
    const url = `${this.comptabiliteUrl}/${endpoint}/generer`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  modifierUneRessource<T>(endpoint: string, id: number, resource: T) {
    const url = `${this.comptabiliteUrl}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }

  supprimerUneResource<T>(endpoint: string, id: number) {
    const url = `${this.comptabiliteUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }


  changeEtatResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<any> {
    const url = `${this.comptabiliteUrl}/${endpoint}/${id}/changeretat`;
    return this.http.patch<ResponseMessage>(url, resource, this.httpOptions);
  }

  enregistrerExercicetWithFiles<T>(endpoint: string, formData: FormData) {
    const url = `${this.comptabiliteUrl}/${endpoint}/enregistrerwithfiles`;
    return this.http.post<ResponseMessage>(url, formData);
  }

}
