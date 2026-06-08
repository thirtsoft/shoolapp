import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardStatsEleve } from '../../../core/models/statistique/eleve/dashboard-stats-eleve';
import { DashboardStatsEleveList } from '../../../core/models/statistique/eleve/dashboard-stats-eleve-list';

@Injectable({
  providedIn: 'root'
})
export class DashboardParentService {

  baseUrl = environment.apiBaseUrl;
  statistiqueUrl = this.baseUrl + "/statistique";

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  afficherLesStatsGlobaleEleve(eleveId: number): Observable<DashboardStatsEleve> {
    const url = `${this.statistiqueUrl}/eleve/${eleveId}`;
    return this.http.get<DashboardStatsEleve>(url, this.httpOptions);
  }

  afficherLesListDeStatsGlobaleEleve(eleveId: number): Observable<DashboardStatsEleveList> {
    const url = `${this.statistiqueUrl}/list/eleve/${eleveId}`;
    return this.http.get<DashboardStatsEleveList>(url, this.httpOptions);
  }



}
