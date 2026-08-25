import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SetupProcessStartRequest } from '../../../core/models/setup/request/setup-process-start-request.model';
import { SetupProcessResponse } from '../../../core/models/setup/response/setup-process-response.model';
import { ApiResponse } from '../../../core/datamodel/api-response.model';
import { SetupEtablissementRequest } from '../../../core/models/setup/request/setup-etablissement-request.model';
import { SetupAnneeScolaireRequest } from '../../../core/models/setup/request/setup-annee-scolaire-request.model';
import { SetupStructurePedagogiqueRequest } from '../../../core/models/setup/request/setup-structure-pedagogique-request.model';
import { SetupClasseRequest } from '../../../core/models/setup/request/setup-classe-request.model';
import { SetupPeriodeScolaireRequest } from '../../../core/models/setup/request/setup-periode-scolaire-request.model';
import { SetupMatieresRequest } from '../../../core/models/setup/request/setup-matieres-request.model';
import { SetupOrganizationResponse } from '../../../core/models/setup/response/setup-organization-response.model';

@Injectable({
  providedIn: 'root'
})
export class SetupApiService {

  private readonly http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  baseUrl_1 = environment.apiBaseUrl;

  private readonly setupUrl = this.baseUrl_1 + '/setup';


  startSetup(request: SetupProcessStartRequest): Observable<SetupProcessResponse> {
    const url = `${this.setupUrl}/start`;
    return this.http.post<SetupProcessResponse>(
      url,
      request
    );
  }


  editerEtablissement(setupUuid: string, request: SetupEtablissementRequest): Observable<SetupProcessResponse> {
    return this.http.patch<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/etablissement`,
      request
    );
  }

  enregistrerAnneeScolaire(setupUuid: string, request: SetupAnneeScolaireRequest): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/annee-scolaire`,
      request
    );
  }

  enregistrerStructurePedagogique(setupUuid: string, request: SetupStructurePedagogiqueRequest): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/structure-pedagogique`,
      request
    );
  }

  enregistrerClasses(setupUuid: string, request: SetupClasseRequest): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/classes`,
      request
    );
  }

  enregistrerPeriodes(setupUuid: string, request: SetupPeriodeScolaireRequest): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/periodicite`,
      request
    );
  }

  enregistrerMatieres(setupUuid: string, request: SetupMatieresRequest): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/matieres`,
      request
    );
  }

  finaliser(setupUuid: string): Observable<SetupProcessResponse> {
    return this.http.post<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/finaliser`,
      {}
    );
  }

  afficherSetupProcess(setupUuid: string): Observable<SetupProcessResponse> {
    return this.http.get<SetupProcessResponse>(
      `${this.setupUrl}/${setupUuid}/details`,
      {}
    );
  }

  getCurrent(): Observable<SetupOrganizationResponse> {
    return this.http.get<SetupOrganizationResponse>(
      `${this.setupUrl}/current`
    );
  }


}