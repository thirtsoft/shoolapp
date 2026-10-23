import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DataResult } from '../../../core/datamodel/data-model';
import { CongesRequest } from '../../../core/models/rh/conges-request.model';
import { CongesResponse } from '../../../core/models/rh/conges-response.model';
import { ContratRequest } from '../../../core/models/rh/contrat-request.model';
import { ContratResponse } from '../../../core/models/rh/contrat-response.model';
import { DemandeAvanceSalaireResponse } from '../../../core/models/rh/demande-avance-salaire-response.model';
import { DemandeBonSalaireRequest } from '../../../core/models/rh/demande-bon-salaire-request.model';
import { DetailsContratResponse } from '../../../core/models/rh/details-contrat-response.model';
import { DetailsPaieResponse } from '../../../core/models/rh/details-paie-response.model';
import { MotifRejetConges } from '../../../core/models/rh/motif-rejet-conges-request.model';
import { PaieRequest } from '../../../core/models/rh/paie-request.model';
import { PersonnelRequest } from '../../../core/models/rh/personnel-request.model';
import { PersonnelResponse } from '../../../core/models/rh/personnel-response.model';
import { ResponseMessage } from '../../../core/response/response-message';
import { DetailsDemandeAvanceSalaireComponent } from '../pages/demandeavancesalaire/details-demande-avance-salaire-component/details-demande-avance-salaire-component';

@Injectable({
  providedIn: 'root'
})
export class RhResourceService {

  baseUrl_1 = environment.apiBaseUrl;
  rhUrl = this.baseUrl_1 + '/rh';
  documentUrl = this.baseUrl_1 + '/v1/storage';
  congesUrl = `${this.baseUrl_1}/conges`;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.rhUrl}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourceListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.rhUrl}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.rhUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.rhUrl}/${endpoint}`;

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

  recupererUneResource<T>(endpoint: string, uuid: string): Observable<T> {
    const url = `${this.rhUrl}/${endpoint}/${uuid}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  recupererDetailsUneResource<T>(endpoint: string, uuid: string): Observable<T> {
    const url = `${this.rhUrl}/${endpoint}/${uuid}/details`;
    return this.http.get<T>(url, this.httpOptions);
  }

  creerUneRessource<T>(endpoint: string, resource: T) {
    const url = `${this.rhUrl}/${endpoint}/save`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  modifierUneRessource<T>(endpoint: string, uuid: string, resource: T) {
    const url = `${this.rhUrl}/${endpoint}/update/${uuid}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }

  supprimerUneResource<T>(endpoint: string, uuid: string) {
    const url = `${this.rhUrl}/${endpoint}/'delete'/${uuid}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  createPersonnel(request: PersonnelRequest): Observable<PersonnelResponse> {
    const url = `${this.rhUrl}/personnels`;
    return this.http.post<PersonnelResponse>(url, request);
  }

  getPersonnel(uuid: string): Observable<PersonnelResponse> {
    return this.http.get<PersonnelResponse>(`${this.rhUrl}/'personnels/${uuid}`);
  }

  creerContrat(request: ContratRequest, fichier: File): Observable<ContratResponse> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    formData.append('fichier', fichier, fichier.name);

    return this.http.post<ContratResponse>(`${this.rhUrl}/contrats`, formData);
  }

  modifierContrat(uuid: string, request: ContratRequest, fichier?: File | null): Observable<ContratResponse> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(request));
    if (fichier) {
      formData.append('fichier', fichier, fichier.name);
    }
    return this.http.put<ContratResponse>(`${this.rhUrl}/contrats/${uuid}`, formData);
  }

  getContratByUuid(uuid: string): Observable<ContratResponse> {
    return this.http.get<ContratResponse>(`${this.rhUrl}/contrats/${uuid}`);
  }

  getDetailsContrat(uuid: string): Observable<DetailsContratResponse> {
    return this.http.get<DetailsContratResponse>(`${this.rhUrl}/contrats/${uuid}/details`);
  }

  getDocumentContent(fileStorageUuid: string): Observable<Blob> {
    return this.http.get(
      `${this.documentUrl}/content/${fileStorageUuid}`,
      {
        responseType: 'blob'
      }
    );
  }

  creerPaie(request: PaieRequest): Observable<any> {
    return this.http.post<any>(`${this.rhUrl}/paies`, request);
  }

  modifierPaie(uuid: string, request: PaieRequest): Observable<any> {
    return this.http.patch<any>(`${this.rhUrl}/paies/${uuid}`, request);
  }

  getPaieByUuid(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.rhUrl}/paies/${uuid}`);
  }

  getDetailsPaie(uuid: string): Observable<DetailsPaieResponse> {
    return this.http.get<DetailsPaieResponse>(`${this.rhUrl}/paies/${uuid}/details`);
  }

  getDemandeBonSalaire(uuid: string): Observable<DemandeAvanceSalaireResponse> {
    return this.http.get<DemandeAvanceSalaireResponse>(`${this.rhUrl}/demandes-avance-salaire/${uuid}`);
  }

  getDetailsBonSalairee(uuid: string): Observable<DetailsDemandeAvanceSalaireComponent> {
    return this.http.get<DetailsDemandeAvanceSalaireComponent>(`${this.rhUrl}/demandes-avance-salaire/${uuid}/details`);
  }

  creerMaDemande(request: DemandeBonSalaireRequest): Observable<DemandeAvanceSalaireResponse> {
    return this.http.post<any>(`${this.rhUrl}/demandes-avance-salaire/me`, request);
  }

  modifierMaDemande(uuid: string, request: DemandeBonSalaireRequest): Observable<DemandeAvanceSalaireResponse> {
    return this.http.patch<any>(`${this.rhUrl}/demandes-avance-salaire/me/${uuid}`, request);
  }

  envoyerMaDemande(uuid: string): Observable<DemandeAvanceSalaireResponse> {
    return this.http.post<any>(`${this.rhUrl}/demandes-avance-salaire/me/${uuid}/envoyer`, {});
  }

  soumettreDemande(uuid: string): Observable<DemandeAvanceSalaireResponse> {
    return this.http.patch<any>(`${this.rhUrl}/demandes-avance-salaire/${uuid}/soumettre`, {});
  }

  approuverDemande(uuid: string): Observable<DemandeAvanceSalaireResponse> {
    return this.http.patch<any>(`${this.rhUrl}/demandes-avance-salaire/${uuid}/approuver`, {});
  }

  refuserDemande(uuid: string, motifRejet: string): Observable<ResponseMessage> {
    return this.http.patch<ResponseMessage>(
      `${this.rhUrl}/demandes-avance-salaire/${uuid}/refuser`,
      {},
      {
        params: {
          motifRejet
        }
      }
    );
  }

  createConges(request: CongesRequest): Observable<CongesResponse> {
    return this.http.post<CongesResponse>(this.congesUrl, request);
  }

  updateConges(id: number, request: CongesRequest): Observable<CongesResponse> {
    return this.http.patch<CongesResponse>(`${this.congesUrl}/${id}`, request);
  }

  soumettreConges(id: number): Observable<ResponseMessage> {
    return this.http.patch<ResponseMessage>(`${this.congesUrl}/${id}/soumettre`, {});
  }

  approuverConges(id: number): Observable<ResponseMessage> {
    return this.http.patch<ResponseMessage>(`${this.congesUrl}/${id}/approuver`, {});
  }

  refuserConges(id: number, motifRejet: string): Observable<ResponseMessage> {
    return this.http.patch<ResponseMessage>(
      `${this.congesUrl}/${id}/refuser`,
      {},
      {
        params: {
          motifRejet
        }
      }
    );
  }

  getCongesById(id: number): Observable<CongesResponse> {
    return this.http.get<CongesResponse>(`${this.congesUrl}/${id}`);
  }


}