import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EleveRetard } from '../../../../core/models/statistique/eleve-retard';
import { FactureStatut } from '../../../../core/models/statistique/facture-statut';
import { QuatreDernierEvenement } from '../../../../core/models/statistique/quatre-derniers-evenement';
import { SexeRepartition } from '../../../../core/models/statistique/sexe-repartition';
import { DashboardStats } from '../../../../core/models/statistique/stats-globales';
import { DashboardStatsList } from '../../../../core/models/statistique/stats-globales-list';

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

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  afficherNombreEleve(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbreeleve`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherNombreEleveNonInscripts(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbreelevenoninscripts`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherNombreEnseignant(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbreenseignant`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherNombreInscription(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbreinscription`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherNombreClasse(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbreclasse`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherNombreFactureImpayees(): Observable<number> {
    const url = `${this.statistiqueUrl}/nbrefactureimpayees`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherMontantTotalImpaye(): Observable<number> {
    const url = `${this.statistiqueUrl}/totalimpaye`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherMontantTotalPaiementEnAttent(): Observable<number> {
    const url = `${this.statistiqueUrl}/totalenattente`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherMontantTotalPaiementEnRetard(): Observable<number> {
    const url = `${this.statistiqueUrl}/totalenretard`;
    return this.http.get<number>(url, this.httpOptions);
  }

  afficherLesStatsGlobales(): Observable<DashboardStats> {
    const url = `${this.statistiqueUrl}/globales`;
    return this.http.get<DashboardStats>(url, this.httpOptions);
  }

  afficherLesListDeStatsGlobales(): Observable<DashboardStatsList> {
    const url = `${this.statistiqueUrl}/globales/list`;
    return this.http.get<DashboardStatsList>(url, this.httpOptions);
  }



  afficherLeTop5EleveAbsents(): Observable<EleveRetard[]> {
    return this.http.get<EleveRetard[]>(`${this.statistiqueUrl}/top5eleveabsent`);
  }

  afficherLaRepartitionEleveParSexe(): Observable<SexeRepartition[]> {
    return this.http.get<SexeRepartition[]>(`${this.statistiqueUrl}/repartitioneleveparsexe`);
  }

  afficherFacturesEnttentEtRetard(): Observable<FactureStatut[]> {
    return this.http.get<FactureStatut[]>(`${this.statistiqueUrl}/factureenattenteetenretard`);
  }

  afficherLes4DerniersEvenementsProgramme(): Observable<QuatreDernierEvenement[]> {
    return this.http.get<QuatreDernierEvenement[]>(`${this.statistiqueUrl}/quatrederniersevenement`);
  }

}