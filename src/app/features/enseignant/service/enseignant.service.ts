import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/datamodel/api-response.model';
import { ListEleveNote, ListNote } from '../../../core/models/dossiereleve/list-note';
import { Note } from '../../../core/models/dossiereleve/note';
import { Conge } from '../../../core/models/enseignant/conge';
import { CreateEnseignantResponse } from '../../../core/models/enseignant/create-enseignant-response.model';
import { DetailsEnseignant } from '../../../core/models/enseignant/details-enseignant';
import { DetailsEnseignantUtilisateur } from '../../../core/models/enseignant/details-enseignant-utilisateur';
import { Enseignant } from '../../../core/models/enseignant/enseignant';
import { EnseigantList } from '../../../core/models/enseignant/enseignant-list';
import { EnseignantUpdateRequest } from '../../../core/models/enseignant/enseignant-update-request.model';
import { GetEnseignantResponse } from '../../../core/models/enseignant/get-enseignant-response.model';
import { ListeConge } from '../../../core/models/enseignant/liste-conge';
import { ResponseMessage } from '../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class EnseignantService {

  baseUrl = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  getAllEnseignants(): Observable<EnseigantList[]> {
    return this.http.get<EnseigantList[]>(`${this.baseUrl}/enseignant/list`, this.httpOptions);
  }

  getEnseigant(id: number): Observable<Enseignant> {
    return this.http.get<Enseignant>(`${this.baseUrl}/enseignant/${id}`);
  }

  getDetailsEnseigant(id: number): Observable<DetailsEnseignant> {
    return this.http.get<DetailsEnseignant>(`${this.baseUrl}/enseignant/details/${id}`);
  }

  getDetailsEnseignantUtilisateur(id: number): Observable<DetailsEnseignantUtilisateur> {
    return this.http.get<DetailsEnseignantUtilisateur>(`${this.baseUrl}/enseignant/utilisateur/${id}`);
  }

  createEnseigant(info: Enseignant) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/enseignant/save`, info);
  }

  enregistrerEnseignantWithFiles(formData: FormData) {
    return this.http.post<ResponseMessage>(
      this.baseUrl + `/enseignant/enregistrerwithfiles`,
      formData
    );
  }

  enregistrerUnEnseignantWithFiles(formData: FormData) {
    return this.http.post<number>(
      this.baseUrl + `/enseignant/enregistrerenseignantwithfiles`,
      formData
    );
  }

  //
  enregistrerEnseignantAvecPhotoFiles(formData: FormData): Observable<ApiResponse<CreateEnseignantResponse>> {
    return this.http.post<ApiResponse<CreateEnseignantResponse>>(
      `${this.baseUrl}/enseignant/avec-photo`,
      formData
    );
  }

  modifierEnseignant(enseignantUuid: string, request: EnseignantUpdateRequest): Observable<ApiResponse<EnseigantList>> {
    return this.http.patch<ApiResponse<EnseigantList>>(
      `${this.baseUrl}/enseignant/edit/${enseignantUuid}`,
      request
    );
  }

  modifierPhotoEnseignant(enseignantUuid: string, file: File): Observable<ApiResponse<CreateEnseignantResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ApiResponse<CreateEnseignantResponse>>(
      `${this.baseUrl}/enseignant/${enseignantUuid}/photo`,
      formData
    );
  }

  getEnseignantByUuid(enseignantUuid: string): Observable<ApiResponse<GetEnseignantResponse>> {
    return this.http.get<ApiResponse<GetEnseignantResponse>>(
      `${this.baseUrl}/enseignant/by-uuid/${enseignantUuid}`
    );
  }
  //

  updateEnseigant(id: number, value: Enseignant) {
    return this.http.put<number>(`${this.baseUrl}/enseignant/edit/${id}`, value);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/parent/delete/${id}`);
  }

  /****************         Note           ****/

  getAllNotes(): Observable<ListNote[]> {
    return this.http.get<ListNote[]>(`${this.baseUrl}/note`, this.httpOptions);
  }

  getMeilleurEleveDeLaSemaines(): Observable<ListEleveNote[]> {
    return this.http.get<ListEleveNote[]>(`${this.baseUrl}/note/semaine`, this.httpOptions);
  }

  getAllNotesByEleves(eleveId: number): Observable<ListNote[]> {
    return this.http.get<ListNote[]>(`${this.baseUrl}/note/byeleve/${eleveId}`, this.httpOptions);
  }

  getAllNotesByMatiere(matId: number): Observable<ListNote[]> {
    return this.http.get<ListNote[]>(`${this.baseUrl}/note/bymatiere/${matId}`, this.httpOptions);
  }

  getAllNotesBySemestre(semId: number): Observable<ListNote[]> {
    return this.http.get<ListNote[]>(`${this.baseUrl}/note/bysemestre/${semId}`, this.httpOptions);
  }

  getNote(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/note/find/${id}`);
  }

  ajouterNote(info: Note) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/note/save`, info);
  }

  updateNote(id: number, value: Note) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/note/update/${id}`, value);
  }

  deleteNote(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.baseUrl}/note/delete/${id}`);
  }

  /****************    Congés           ****/

  getAllConges(): Observable<ListeConge[]> {
    return this.http.get<ListeConge[]>(`${this.baseUrl}/conges/list`, this.httpOptions);
  }

  getAllCongesSoumis(): Observable<ListeConge[]> {
    return this.http.get<ListeConge[]>(`${this.baseUrl}/conges/soumis`, this.httpOptions);
  }

  getAllCongesAcceptes(): Observable<ListeConge[]> {
    return this.http.get<ListeConge[]>(`${this.baseUrl}/conges/accepte`, this.httpOptions);
  }

  getAllCongesRejetes(): Observable<ListeConge[]> {
    return this.http.get<ListeConge[]>(`${this.baseUrl}/conges/rejete`, this.httpOptions);
  }

  getConge(id: number): Observable<Conge> {
    return this.http.get<Conge>(`${this.baseUrl}/conges/${id}`);
  }

  ajouterConge(info: Conge) {
    return this.http.post<ResponseMessage>(`${this.baseUrl}/conges/save`, info);
  }

  updateConge(id: number, value: Conge) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/conges/update/${id}`, value);
  }

  sendConge(id: number) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/conges/envoyer/${id}`, {});
  }

  acceptedConge(id: number) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/conges/accepter/${id}`, {});
  }

  refuserConge(id: number) {
    return this.http.put<ResponseMessage>(`${this.baseUrl}/conges/refuser/${id}`, {});
  }

  deleteConge(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.baseUrl}/conges/delete/${id}`);
  }

}
