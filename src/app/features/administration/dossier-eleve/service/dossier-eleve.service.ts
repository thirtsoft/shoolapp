import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/datamodel/api-response.model';
import { Paiement } from '../../../../core/models/comptabilite/paiement';
import { DetailsEleve } from '../../../../core/models/dossiereleve/details-eleve';
import { DetailsInscription } from '../../../../core/models/dossiereleve/details-inscription';
import { GetEleveResponse } from '../../../../core/models/dossiereleve/eleve/get-eleve-response.model';
import { ParentSearchToCreateEleve } from '../../../../core/models/dossiereleve/eleve/parent-search-to-create-eleve.model';
import { UpdateElevePhotoResponse } from '../../../../core/models/dossiereleve/eleve/update-eleve-photo-response.model';
import { UpdateEleveRequest } from '../../../../core/models/dossiereleve/eleve/update-eleve-request.model';
import { ListeEleve } from '../../../../core/models/dossiereleve/liste-eleve';
import { Eleve } from '../../../../core/models/dossiereleve/request/eleve';
import { EleveEdit } from '../../../../core/models/dossiereleve/request/eleve-edit';
import { Inscription } from '../../../../core/models/dossiereleve/request/inscription';
import { ListeInscription } from '../../../../core/models/dossiereleve/request/liste-inscription';
import { PaiementAdd } from '../../../../core/models/dossiereleve/request/paiement-add';
import { CreateEleveResponse, ResponseEleve, ResponseMessage } from '../../../../core/models/message/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class DossierEleveService {

  baseUrl = environment.apiBaseUrl;

  eleveUrl = this.baseUrl;
  photoUrl = this.baseUrl + '/v1/storage';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  getResourceList<T>(endpoint: string): Observable<T[]> {
    const url = `${this.eleveUrl}/${endpoint}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }

  getAllEleves(): Observable<Eleve[]> {
    return this.http.get<Eleve[]>(`${this.baseUrl}/eleve`, this.httpOptions);
  }

  getEleve(id: number): Observable<Eleve> {
    return this.http.get<Eleve>(`${this.baseUrl}/eleve/${id}`);
  }

  /*
  getEleveToEdit(id: number): Observable<EleveEdit> {
    return this.http.get<EleveEdit>(`${this.baseUrl}/eleve/gotoedit/${id}`);
  }
 */
  getDetailsEleve(id: number): Observable<DetailsEleve> {
    return this.http.get<DetailsEleve>(`${this.baseUrl}/eleve/details/${id}`);
  }

  getDetailsDossierEleve(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/eleve/${id}/details`);
  }

  /* 
  inscrireEleve(info: Eleve) {
    return this.http.post<ResponseEleve>(`${this.baseUrl}/eleve/save`, info);
  }

  ajouterEleve(info: EleveRequeste) {
    return this.http.post<ResponseEleve>(`${this.baseUrl}/eleve/create`, info);
  }

  enregistrerEleve(eleve: EleveRequest) {
    return this.http.post<ResponseEleve>(`${this.baseUrl}/eleve/enregistrer`, eleve).pipe(
      catchError(error => {
        if (error.status === 400) {
          return of(error.error);
        }
        return throwError(error);
      })
    );

  } */

  enregistrerEleveAvecPhotoFiles(formData: FormData): Observable<ApiResponse<CreateEleveResponse>> {
    return this.http.post<ApiResponse<CreateEleveResponse>>(
      this.baseUrl + `/eleve/avec-photo`,
      formData
    );
  }

  modifierEleve(eleveUuid: string, request: UpdateEleveRequest): Observable<ApiResponse<ListeEleve>> {
    return this.http.patch<ApiResponse<ListeEleve>>(
      `${this.baseUrl}/eleve/${eleveUuid}`,
      request
    );
  }

  modifierPhotoEleve(eleveUuid: string, file: File): Observable<ApiResponse<UpdateElevePhotoResponse>> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.put<ApiResponse<UpdateElevePhotoResponse>>(
      `${this.baseUrl}/eleve/${eleveUuid}/photo`,
      formData
    );
  }

  getEleveByUuid(eleveUuid: string): Observable<ApiResponse<GetEleveResponse>> {
    return this.http.get<ApiResponse<GetEleveResponse>>(
      `${this.baseUrl}/eleve/${eleveUuid}`
    );
  }

  getPhotoContent(fileStorageUuid: string): Observable<Blob> {
    return this.http.get(
      `${this.photoUrl}/content/${fileStorageUuid}`,
      {
        responseType: 'blob'
      }
    );
  }

  getPhotoContentV2(fileStorageUuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.photoUrl}/content/${fileStorageUuid}`);
  }

  updateInscriptionEleve(id: number, value: Eleve) {
    return this.http.put<ResponseEleve>(`${this.baseUrl}/eleve/update/${id}`, value);
  }

  createEleve(info: Eleve) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/eleve/save`, info);
  }

  updateEleve(id: number, value: Eleve) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/eleve/update/${id}`, value);
  }

  editEleve(id: number, value: EleveEdit) {
    return this.http.patch<ResponseEleve>(`${this.baseUrl}/eleve/edit/${id}`, value);
  }

  deleteEleve(id?: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eleve/delete/${id}`);
  }

  /************     Inscription          ************ */
  getAllInscriptions(): Observable<ListeInscription[]> {
    return this.http.get<ListeInscription[]>(`${this.baseUrl}/inscription`, this.httpOptions);
  }

  getListInscriptionsByEleve(eleveId: number): Observable<ListeInscription[]> {
    return this.http.get<ListeInscription[]>(`${this.baseUrl}/inscription/by-eleve/${eleveId}`, this.httpOptions);
  }


  getListInscriptionsByClasse(classId: number): Observable<ListeInscription[]> {
    return this.http.get<ListeInscription[]>(`${this.baseUrl}/inscription/classe/${classId}`, this.httpOptions);
  }

  getInscription(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.baseUrl}/inscription/${id}`);
  }

  getDetailsInscription(id: number): Observable<DetailsInscription> {
    return this.http.get<DetailsInscription>(`${this.baseUrl}/inscription/details/${id}`);
  }

  getInscriptionByCodeEleve(code: string): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.baseUrl}/inscription/${code}`);
  }

  createInscription(info: Inscription) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/inscription/save`, info);
  }

  saveInscription(info: Inscription) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/inscription/save-bis`, info);
  }

  updateInscription(id: number, value: Inscription) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/inscription/update/${id}`, value);
  }

  deleteInscription(id?: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inscription/delete/${id}`);
  }

  /************     Paiement          ************ */


  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/paiement`, this.httpOptions);
  }

  getPaiement(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.baseUrl}/paiement/${id}`);
  }

  createPaiement(info: Paiement) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/paiement/save`, info);
  }


  addPaiement(info: PaiementAdd) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/paiement/add-pay`, info);
  }

  updatePaiement(id: number, value: Paiement) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/paiement/update/${id}`, value);
  }

  deletePaiement(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.baseUrl}/paiement/delete/${id}`);
  }


  rechercherParents(query: string): Observable<ParentSearchToCreateEleve[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    return this.http.get<ParentSearchToCreateEleve[]>(
      `${this.baseUrl}/parent/search`,
      {
        ...this.httpOptions,
        params: {
          query: query.trim()
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la recherche des parents :', error);
        return of([]);
      })
    );
  }
}
