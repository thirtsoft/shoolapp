import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AssiduiteEleveParentResponse, DashboardFinancierParentResponse, DerniereAbsenceParentResponse, DerniereNoteParentResponse, EmploiDuTempsJourParentResponse, ProchaineActiviteParentResponse, ProchaineEvaluationParentResponse, ProchainExerciceParentResponse } from '../../../core/models/dashboard/dashboard-parent.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardParentService {

  baseUrl = environment.apiBaseUrl;
  dashboardParentUrl = this.baseUrl + "/dashboard/parent";

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  getEmploiDuTempsDuJour(classeId: number): Observable<EmploiDuTempsJourParentResponse[]> {
    const params = new HttpParams()
      .set('classeId', classeId);
    return this.http.get<EmploiDuTempsJourParentResponse[]>(
      `${this.dashboardParentUrl}/emploi-du-temps`, { params });
  }

  getAssiduiteEleve(eleveId: number): Observable<AssiduiteEleveParentResponse> {

    const params = new HttpParams()
      .set('eleveId', eleveId);

    return this.http.get<AssiduiteEleveParentResponse>(
      `${this.dashboardParentUrl}/assiduite-eleve`,
      { params }
    );
  }

  getSituationFinanciere(eleveUuid: string): Observable<DashboardFinancierParentResponse> {
    const params = new HttpParams()
      .set('eleveUuid', eleveUuid);
    return this.http.get<DashboardFinancierParentResponse>(
      `${this.dashboardParentUrl}/situation-financiere`,
      { params }
    );
  }

  getDernieresNotesEleve(eleveId: number): Observable<DerniereNoteParentResponse[]> {
    const params = new HttpParams()
      .set('eleveId', eleveId);

    return this.http.get<DerniereNoteParentResponse[]>(
      `${this.dashboardParentUrl}/dernieres-notes-eleve`,
      { params }
    );
  }

  getDernieresAbsencesEleve(eleveId: number): Observable<DerniereAbsenceParentResponse[]> {

    const params = new HttpParams()
      .set('eleveId', eleveId);

    return this.http.get<DerniereAbsenceParentResponse[]>(
      `${this.dashboardParentUrl}/dernieres-absences-eleve`,
      { params }
    );
  }

  getProchainesEvaluations(eleveId: number): Observable<ProchaineEvaluationParentResponse[]> {

    const params = new HttpParams()
      .set('eleveId', eleveId);

    return this.http.get<ProchaineEvaluationParentResponse[]>(
      `${this.dashboardParentUrl}/prochaines-evaluations`,
      { params }
    );
  }

  getProchainsExercices(eleveId: number): Observable<ProchainExerciceParentResponse[]> {

    const params = new HttpParams()
      .set('eleveId', eleveId);

    return this.http.get<ProchainExerciceParentResponse[]>(
      `${this.dashboardParentUrl}/prochains-exercices`,
      { params }
    );
  }

  getProchainesActivites(): Observable<ProchaineActiviteParentResponse[]> {
    return this.http.get<ProchaineActiviteParentResponse[]>(
      `${this.dashboardParentUrl}/prochaines-activites`
    );
  }


}