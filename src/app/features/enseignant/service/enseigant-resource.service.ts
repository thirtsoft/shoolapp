import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DataResult } from '../../../core/datamodel/data-model';
import { ResponseMessage } from '../../../core/response/response-message';
@Injectable({
  providedIn: 'root'
})
export class EnseigantResourceService {

  enseignantUrl = environment.apiBaseUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }


  getResourceList<T>(endpoint: string): Observable<T> {
    const url = `${this.enseignantUrl}/${endpoint}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getResourcePaged<T>(endpoint: string, page: number, size: number): Observable<DataResult<T>> {
    const url = `${this.enseignantUrl}/${endpoint}/page`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<T>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getSingleResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.enseignantUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  getDetailsResource<T>(endpoint: string, id: number): Observable<T> {
    const url = `${this.enseignantUrl}/${endpoint}/${id}`;
    return this.http.get<T>(url, this.httpOptions);
  }

  createRessource<T>(endpoint: string, resource: T): Observable<DataResult<T>> {
    const url = `${this.enseignantUrl}/${endpoint}/save`;
    return this.http.post<DataResult<T>>(url, resource, this.httpOptions);
  }

  updateResource<T>(endpoint: string, id: number, resource: Partial<T>): Observable<T> {
    const url = `${this.enseignantUrl}/${endpoint}/update/${id}`;
    return this.http.put<T>(url, resource, this.httpOptions);
  }


  deleteResource<T>(endpoint: string, id: number) {
    const url = `${this.enseignantUrl}/${endpoint}/'delete'/${id}`;
    return this.http.delete<ResponseMessage>(url, this.httpOptions);
  }

}
