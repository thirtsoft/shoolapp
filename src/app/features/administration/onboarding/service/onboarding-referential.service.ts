import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { DataResult } from '../../../../core/datamodel/data-model';
import { CountryResponse } from '../../../../core/models/onboarding/country-response';
import { CurrencyResponse } from '../../../../core/models/onboarding/currency-response';
import { DepartmentResponse } from '../../../../core/models/onboarding/department-response';
import { LanguageResponse } from '../../../../core/models/onboarding/language-response';
import { OrganizationResponse } from '../../../../core/models/onboarding/organization/organization-response';
import { RegionResponse } from '../../../../core/models/onboarding/region-response';
import { SubscriptionCatalogResponse } from '../../../../core/models/onboarding/subscription-catalog-response';
import { TimeZoneResponse } from '../../../../core/models/onboarding/time-zone-response';
import { OrganizationTypeResponse } from '../../../../core/models/onboarding/type-organization-response';
import { TenantTypeResponse } from '../../../../core/models/onboarding/type-tenant-response';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class OnboardingReferentialService {

  baseUrl_1 = environment.apiBaseUrl;
  comptabiliteUrl = this.baseUrl_1 + '/comptabilite';
  referentielUrl = this.baseUrl_1 + '/api/referentielgeneral';
  tenantUrl = this.baseUrl_1 + '/api/v1/tenant-types';
  typeOrganizationUrl = this.baseUrl_1 + '/api/v1/organization-types';
  organizationUrl = this.baseUrl_1 + '/platform/organizations';
  catalogSubscriptionUrl = this.baseUrl_1 + '/subscription';


  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  getCountries(): Observable<ApiResponse<CountryResponse[]>> {

    return this.http.get<ApiResponse<CountryResponse[]>>(
      `${this.referentielUrl}/countries/list`
    );

  }

  getCurrencies(): Observable<ApiResponse<CurrencyResponse[]>> {
    return this.http.get<ApiResponse<CurrencyResponse[]>>(
      `${this.referentielUrl}/currencies/list`
    );

  }

  getLanguages(): Observable<ApiResponse<LanguageResponse[]>> {
    return this.http.get<ApiResponse<LanguageResponse[]>>(
      `${this.referentielUrl}/languages/list`
    );

  }

  getTimezones(): Observable<ApiResponse<TimeZoneResponse[]>> {
    return this.http.get<ApiResponse<TimeZoneResponse[]>>(
      `${this.referentielUrl}/timezones/list`
    );
  }

  getRegions(countryUuid: string): Observable<ApiResponse<RegionResponse[]>> {
    return this.http.get<ApiResponse<RegionResponse[]>>(
      `${this.referentielUrl}/regions/country/${countryUuid}`
    );

  }

  getDepartments(regionUuid: string): Observable<ApiResponse<DepartmentResponse[]>> {
    return this.http.get<ApiResponse<DepartmentResponse[]>>(
      `${this.referentielUrl}/departments/region/${regionUuid}`
    );
  }

  getTenantTypes(): Observable<ApiResponse<TenantTypeResponse[]>> {
    return this.http.get<ApiResponse<TenantTypeResponse[]>>(
      `${this.tenantUrl}/list`
    );

  }

  getTypeOrganizations(): Observable<ApiResponse<OrganizationTypeResponse[]>> {
    return this.http.get<ApiResponse<OrganizationTypeResponse[]>>(
      `${this.typeOrganizationUrl}/list`
    );

  }

  getSubscriptionCatalog(): Observable<ApiResponse<SubscriptionCatalogResponse>> {
    return this.http.get<ApiResponse<SubscriptionCatalogResponse>>(
      `${this.catalogSubscriptionUrl}/catalog`
    );

  }

  getOrganizationByUUID(organizationUuid: string): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(
      `${this.organizationUrl}/${organizationUuid}`, this.httpOptions
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

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.comptabiliteUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
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

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.comptabiliteUrl}/${endpoint}`;

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
