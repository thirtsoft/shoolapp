import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  baseUrl_1 = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }


  desactiverResource(endpoint: string, id: number) {
    const url = `${this.baseUrl_1}/${endpoint}/desactiver/${id}`;
    return this.http.delete(url, this.httpOptions);
  }

  activeResource(endpoint: string, id: number) {
    const url = `${this.baseUrl_1}/${endpoint}/activer/${id}`;
    return this.http.post(url, null, this.httpOptions);

  }

  getAllMois(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl_1}/base/mois`);
  }

  getAllAnnees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl_1}/base/annees`);
  }

  getAllStatusFactures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl_1}/base/statusfacture`);
  }

  getAllStatusEvenements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl_1}/base/statusevenement`);
  }

  getEtatEvaluations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl_1}/base/etatevaluation`);
  }


}
