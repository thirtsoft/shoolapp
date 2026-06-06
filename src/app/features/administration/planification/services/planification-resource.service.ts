import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DataResult } from '../../../../core/datamodel/data-model';
import { Cours } from '../../../../core/models/planification/cours';
import { EmploiDuTemps } from '../../../../core/models/planification/emploi-du-temp';
import { Enseignement } from '../../../../core/models/planification/enseignement';
import { Evenement } from '../../../../core/models/planification/evenement';
import { Exercice } from '../../../../core/models/planification/exercice';
import { ListeEmploiDuTemps } from '../../../../core/models/planification/list-emploi-du-temp';
import { ListeCours } from '../../../../core/models/planification/liste-cours';
import { ListeEnseignement } from '../../../../core/models/planification/liste-enseignement';
import { ListeExercie } from '../../../../core/models/planification/liste-exercice';
import { Meeting } from '../../../../core/models/planification/meeting';
import { ResponseMessage } from '../../../../core/response/response-message';

@Injectable({
  providedIn: 'root'
})
export class PlanificationResourceService {

  planificationUrl = environment.apiBaseUrl;
  enseignantUrl = this.planificationUrl + '/planification';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }


  getResourceList<T>(endpoint: string): Observable<T> {
    const url = `${this.planificationUrl}/${endpoint}/list`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getResourceListByElement<T>(endpoint: string, id: number): Observable<T[]> {
    const url = `${this.planificationUrl}/${endpoint}/${id}`;
    return this.http.get<T[]>(url, this.httpOptions);
  }


  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.planificationUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getResourceByIdPaged<T>(endpoint: string, id: number, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.planificationUrl}/${endpoint}/${id}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.planificationUrl}/${endpoint}`;

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
    let url = `${this.planificationUrl}/${endpoint}/${id}`;

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

  getResourceIdPaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.planificationUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getSingleResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.planificationUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getSingleResourceAttendRecordByMultiplesParameters<T>(endpoint: string, id: number, param: string): Observable<T> {
    const url = `${this.planificationUrl}/${endpoint}/${id}/attendancesource/${param}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getExercicet(id: number): Observable<Exercice> {
    return this.http.get<Exercice>(`${this.planificationUrl}/planification/exercice/${id}`);
  }

  getDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.planificationUrl}/${endpoint}/details/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  createRessource<T>(endpoint: string, resource: T): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/save`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  createMultipleRessource<T>(endpoint: string, resource: T): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/saveplus`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  createEditRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.planificationUrl}/${endpoint}/saveedit`;
    return this.http.post<DataResult<T>>(url, resource);
  }

  updateResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }

  changerEtatResource<T>(endpoint: string, id: number): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/changeretat/${id}`;
    return this.http.patch<ResponseMessage>(url, this.httpOptions);
  }

  changeEtatResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/${id}/changeretat`;
    return this.http.patch<ResponseMessage>(url, resource, this.httpOptions);
  }


  updateMultipleResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<any> {
    const url = `${this.planificationUrl}/${endpoint}/updateplus/${id}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.planificationUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  enregistrerExercicetWithFiles(formData: FormData) {
    return this.http.post<number>(
      this.planificationUrl + `/planification/exercice/enregistrerwithfiles`,
      formData
    );
  }


  /*************     Meeting      ***********/

  getAllMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.planificationUrl}/planification/meeting`);
  }

  getMeetingPaged(page: number = 0, size: number = 100): Observable<DataResult<Meeting>> {
    const url = `${this.planificationUrl}/planification/meeting/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Meeting>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getMeetingById(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.planificationUrl}/planification/meeting/${id}`);
  }

  getMeetingByCode(code: string): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.planificationUrl}/planification/meeting/by-code/${code}`);
  }

  getMeetingByLibelle(libelle: string): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.planificationUrl}/planification/meeting/by-libelle/${libelle}`);
  }

  createMeeting(info: Meeting) {
    return this.http.post<ResponseMessage>(`${this.planificationUrl}/planification/meeting/save`, info);
  }

  updateMeeting(id: number, value: Meeting) {
    return this.http.put<ResponseMessage>(`${this.planificationUrl}/planification/meeting/update/${id}`, value);
  }

  deleteMeeting(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/planification/meeting/delete/${id}`);
  }

  /*************     Evenement      ***********/

  getAllEvenements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.planificationUrl}/planification/evenement`);
  }

  getEvenementPaged(page: number = 0, size: number = 100): Observable<DataResult<Evenement>> {
    const url = `${this.planificationUrl}/planification/evenement/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Evenement>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getEvenementById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.planificationUrl}/planification/evenement/${id}`);
  }

  getEvenementByLibelle(libelle: string): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.planificationUrl}/planification/evenement/by-libelle/${libelle}`);
  }

  createEvenement(info: Evenement) {
    return this.http.post<ResponseMessage>(`${this.planificationUrl}/planification/evenement/save`, info);
  }

  updateEvenement(id: number, value: Evenement) {
    return this.http.put<ResponseMessage>(`${this.planificationUrl}/planification/evenement/update/${id}`, value);
  }

  deleteEvenement(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/planification/evenement/delete/${id}`);
  }


  /*************     Emploi du temps      ***********/

  getAllEmploiDutemps(): Observable<ListeEmploiDuTemps[]> {
    return this.http.get<ListeEmploiDuTemps[]>(`${this.planificationUrl}/planification/emploidutemps`);
  }

  getEmploiDuTempsPaged(page: number = 0, size: number = 100): Observable<DataResult<ListeEmploiDuTemps>> {
    const url = `${this.planificationUrl}/planification/emploidutemps/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<ListeEmploiDuTemps>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getEmploiDuTemps(id: number): Observable<EmploiDuTemps> {
    return this.http.get<EmploiDuTemps>(`${this.planificationUrl}/planification/emploidutemps/${id}`);
  }

  createEmploiDuTemps(info: EmploiDuTemps) {
    return this.http.post<ResponseMessage>(`${this.planificationUrl}/planification/emploidutemps/save`, info);
  }

  updateEmploiDuTemps(id: number, value: EmploiDuTemps) {
    return this.http.put<ResponseMessage>(`${this.planificationUrl}/planification/emploidutemps/update/${id}`, value);
  }

  deleteEmploiDuTemps(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/planification/emploidutemps/delete/${id}`);
  }

  /**************               Resource  *******************/
  recupererUneResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.planificationUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  creerUneRessource<T>(endpoint: string, resource: T) {
    const url = `${this.planificationUrl}/${endpoint}/save`;
    return this.http.post<ResponseMessage>(url, resource, this.httpOptions);
  }

  modifierUneRessource<T>(endpoint: string, id: number, resource: T) {
    const url = `${this.planificationUrl}/${endpoint}/update/${id}`;
    return this.http.put<ResponseMessage>(url, resource, this.httpOptions);
  }

  supprimerUneResource<T>(endpoint: string, id: number) {
    const url = `${this.planificationUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

  /****************    Exercie           ****/

  getAllExercies(): Observable<ListeExercie[]> {
    return this.http.get<ListeExercie[]>(`${this.planificationUrl}/exercice/list`, this.httpOptions);
  }

  getAllNotesByClasse(classeId: number): Observable<ListeExercie[]> {
    return this.http.get<ListeExercie[]>(`${this.planificationUrl}/exercice/byclasse/${classeId}`, this.httpOptions);
  }

  getAllNotesByEnseignant(ensId: number): Observable<ListeExercie[]> {
    return this.http.get<ListeExercie[]>(`${this.planificationUrl}/exercice/byenseignant/${ensId}`, this.httpOptions);
  }

  getExercice(id: number): Observable<Exercice> {
    return this.http.get<Exercice>(`${this.planificationUrl}/exercice/find/${id}`);
  }

  ajouterExercice(info: Exercice) {
    return this.http.post<any>(`${this.planificationUrl}/exercice/save`, info);
  }

  updateExercice(id: number, value: Exercice) {
    return this.http.put<any>(`${this.planificationUrl}/exercice/update/${id}`, value);
  }

  deleteExercice(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/exercice/delete/${id}`);
  }

  // *****************  Cours **********************//

  getAllCourses(): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}/planification/cours/list`, this.httpOptions);
  }

  getCourseDeLaSemaine(): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}//planificationcours/semaine`, this.httpOptions);
  }

  getListeCoursByClasse(classeId: number): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}/planification/cours/byclasse/${classeId}`, this.httpOptions);
  }

  getListeCoursByMatiere(matId: number): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}/planification/cours/bymatiere/${matId}`, this.httpOptions);
  }

  getListeCoursByEnseignant(ensId: number): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}/planification/cours/byenseignant/${ensId}`, this.httpOptions);
  }

  getListeCoursSemaineByEnseignant(ensId: number): Observable<ListeCours[]> {
    return this.http.get<ListeCours[]>(`${this.planificationUrl}/planification/cours/semaine/byenseignant/${ensId}`, this.httpOptions);
  }

  getCourse(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.planificationUrl}/planification/cours/${id}`);
  }

  ajouterCourse(info: Cours) {
    return this.http.post<ResponseMessage>(`${this.planificationUrl}/planification/cours/save`, info);
  }

  updateCourse(id: number, value: Cours) {
    return this.http.put<ResponseMessage>(`${this.planificationUrl}/planification/cours/update/${id}`, value);
  }

  deleteCourse(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/planification/cours/delete/${id}`);
  }

  /****************    enseignement           ****/

  getAllEnseignement(): Observable<ListeEnseignement[]> {
    return this.http.get<ListeEnseignement[]>(`${this.planificationUrl}/planification/enseignement/list`, this.httpOptions);
  }

  getAllEnseignementByEnseignant(ensignantId: number): Observable<ListeEnseignement[]> {
    return this.http.get<ListeEnseignement[]>(`${this.planificationUrl}/planification/enseignement/enseignant/${ensignantId}`, this.httpOptions);
  }

  getAllEnseignementByclasse(classeId: number): Observable<ListeEnseignement[]> {
    return this.http.get<ListeEnseignement[]>(`${this.planificationUrl}/planification/enseignement/by-classe/${classeId}`, this.httpOptions);
  }

  getEnseignement(id: number): Observable<Enseignement> {
    return this.http.get<Enseignement>(`${this.planificationUrl}/planification/enseignement/${id}`);
  }

  ajouterEnseignement(info: Enseignement) {
    return this.http.post<ResponseMessage>(`${this.planificationUrl}/planification/enseignement/save`, info);
  }

  updateEnseignement(id: number, value: Enseignement) {
    return this.http.put<ResponseMessage>(`${this.planificationUrl}/planification/enseignement/update/${id}`, value);
  }

  deleteEnseignement(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.planificationUrl}/planification/enseignement/delete/${id}`);
  }

  countEnseignementByEnseignant(id: number): Observable<number> {
    return this.http.get<number>(`${this.planificationUrl}/planification/enseignement/enseignant/${id}/count`);
  }


}
