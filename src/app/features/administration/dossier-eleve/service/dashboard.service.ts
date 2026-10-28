import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SexeRepartition } from '../../../../core/models/statistique/sexe-repartition';
import { DashboardEleveSuivi, DashboardKpiElevesInscrits, DashboardKpiEvaluations, DashboardKpiPedagogie, DashboardKpiPresence, DashboardKpiRecouvrement } from '../../../../core/models/dashboard/dashboard-direction.model';
import { ActiviteAVenir } from '../../../../core/models/planification/activite-a-venir';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  baseUrl = environment.apiBaseUrl;
  statistiqueUrl = this.baseUrl + "/statistique";
  inscriptionUrl = this.baseUrl + "/inscription";
  enseignantUrl = this.baseUrl + "/enseignant";
  comptabiliteUrl = this.baseUrl + "/comptabilite";
  planificationUrl = this.baseUrl + "/planification";
  dashboardDirectionUrl = this.baseUrl + "/dashboard/direction";

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  afficherLaRepartitionEleveParSexe(): Observable<SexeRepartition[]> {
    return this.http.get<SexeRepartition[]>(`${this.statistiqueUrl}/repartitioneleveparsexe`);
  }

  obtenirKpiElevesInscrits(): Observable<DashboardKpiElevesInscrits> {
    return this.http.get<DashboardKpiElevesInscrits>(
      `${this.dashboardDirectionUrl}/kpis/eleves-inscrits`
    );
  }

  obtenirKpiPresence(date: string) {
    return this.http.get<DashboardKpiPresence>(
      `${this.dashboardDirectionUrl}/kpis/presence`,
      {
        params: { date }
      }
    );
  }

  obtenirKpiRecouvrement(): Observable<DashboardKpiRecouvrement> {
    return this.http.get<DashboardKpiRecouvrement>(
      `${this.dashboardDirectionUrl}/kpis/recouvrement`
    );
  }

  obtenirKpiEvaluations(): Observable<DashboardKpiEvaluations> {
    return this.http.get<DashboardKpiEvaluations>(
      `${this.dashboardDirectionUrl}/kpis/evaluations`
    );
  }

  rechercherElevesNecessitantSuivi(): Observable<DashboardEleveSuivi[]> {
    return this.http.get<DashboardEleveSuivi[]>(
      `${this.dashboardDirectionUrl}/eleves-necessitant-suivi`
    );
  }

  rechercherKpiEncaissement(): Observable<DashboardKpiRecouvrement> {
    return this.http.get<DashboardKpiRecouvrement>(
      `${this.dashboardDirectionUrl}/kpis/encaissement`
    );
  }

  rechercherKpiPedagogie(): Observable<DashboardKpiPedagogie> {
    return this.http.get<DashboardKpiPedagogie>(
      `${this.dashboardDirectionUrl}/kpis/pedagogie`
    );
  }

  afficherActiviteAVenirAdministration(): Observable<ActiviteAVenir[]> {
    return this.http.get<ActiviteAVenir[]>(
      `${this.dashboardDirectionUrl}/activites-administration`
    );
  }




}