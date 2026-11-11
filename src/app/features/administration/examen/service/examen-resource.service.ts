import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EleveExamenResponse, ExamenDetailsResponse, ExamenResponse, GenererExamenRequest, RenseignerResultatsExamenRequest } from '../../../../core/models/examen/eleve-examen-response';

@Injectable({
  providedIn: 'root'
})
export class ExamenResourceService {

  baseUrl_1 = environment.apiBaseUrl;
  examenUrl = this.baseUrl_1 + '/examen'

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);

  genererExamens(request: GenererExamenRequest): Observable<ExamenResponse[]> {
    return this.http.post<ExamenResponse[]>(`${this.examenUrl}/generer`, request, this.httpOptions);
  }

  getElevesExamen(examenUuid: string): Observable<EleveExamenResponse[]> {
    return this.http.get<EleveExamenResponse[]>(`${this.examenUrl}/${examenUuid}/eleves`, this.httpOptions);
  }

  getDetailsExamen(examenUuid: string): Observable<ExamenDetailsResponse> {
    return this.http.get<ExamenDetailsResponse>(`${this.examenUrl}/${examenUuid}/details`, this.httpOptions);
  }


  renseignerResultats(request: RenseignerResultatsExamenRequest): Observable<void> {
    return this.http.put<void>(`${this.examenUrl}/resultats`,
      request, this.httpOptions
    );
  }


  findExamens(anneeScolaireUuid: string): Observable<ExamenResponse[]> {
    return this.http.get<ExamenResponse[]>(
      `${this.examenUrl}`,
      {
        ...this.httpOptions,
        params: {
          anneeScolaireUuid
        }
      }
    );
  }




}