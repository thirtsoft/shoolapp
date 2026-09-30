import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DataResult } from '../../../core/datamodel/data-model';
import { DemandeDemoRequest } from '../../../../app/core/models/website/demande-demo-request';
import { DemandeDemoResponse } from '../../../../app/core/models/website/demande-demo-response';



@Injectable({
  providedIn: 'root'
})
export class DemandeDemoService {

  baseUrl = environment.apiBaseUrl;
  demandeDemoUrl = this.baseUrl + "/demande-demo";

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  private readonly http = inject(HttpClient);


  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.demandeDemoUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  fetchFilterDataTable<T>(endpoint: string, page: number, size: number, filters?: any): Observable<DataResult<T>> {
    let url = `${this.demandeDemoUrl}/${endpoint}`;

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

  creer(request: DemandeDemoRequest): Observable<DemandeDemoResponse> {
    return this.http.post<DemandeDemoResponse>(
      this.demandeDemoUrl,
      request
    );
  }

  getByUuid(uuid: string): Observable<DemandeDemoResponse> {
    return this.http.get<DemandeDemoResponse>(
      `${this.demandeDemoUrl}/${uuid}`
    );
  }


}
