import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PieceJointe } from '../piecejointe/piece-jointe';
import { ResponseMessage } from '../response/response-message';
import { TypeDocumentEvaluation } from '../models/piecejointe/type-document-evaluation';

@Injectable({
  providedIn: 'root'
})
export class PieceJointeService {

  pieceJointeUrl = environment.apiBaseUrl;

  documentUrl = this.pieceJointeUrl + '/v1/storage';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  uploadUnePieceJointe(file: File, piecesJointesDTO: PieceJointe): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('piecesjointes', JSON.stringify(piecesJointesDTO));

    return this.http.post<any>(`${this.pieceJointeUrl}/ged/piecejointes/save`, formData);
  }

  uploadUnePieceJointeObjetV1<T>(endpoint: string, id: number, resource: T) {
    const url = `${this.pieceJointeUrl}/${endpoint}/${id}/piece-jointe`;
    return this.http.put<ResponseMessage>(url, resource);
  }

  uploadUnePieceJointeObjet(endpoint: string, id: number, file: File): Observable<any> {
    const url = `${this.pieceJointeUrl}/${endpoint}/${id}/piece-jointe`;
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.put<ResponseMessage>(url, formData).pipe(
      catchError((error) => {
        console.error('❌ Erreur upload pièce jointe:', error);
        return throwError(() => error);
      })
    );
  }

  uploadPieceJointeEvaluation(evaluationUuid: number, file: File, typeDocument: TypeDocumentEvaluation): Observable<any> {
    const url = `${this.pieceJointeUrl}/evaluation/${evaluationUuid}/piecejointe`;
    const formData = new FormData();

    formData.append('file', file, file.name);
    formData.append('typeDocument', typeDocument);

    return this.http.put<any>(url, formData).pipe(
      catchError((error) => {
        console.error(
          '❌ Erreur upload pièce jointe évaluation:',
          error
        );

        return throwError(() => error);
      })
    );
  }

  getDocumentContent(fileStorageUuid: string): Observable<Blob> {
    return this.http.get(
      `${this.documentUrl}/content/${fileStorageUuid}`,
      {
        responseType: 'blob'
      }
    );
  }


  supprimerPieceJointe(id: number) {
    const url = `${this.pieceJointeUrl}/ged/piecejointes/${id}`;
    return this.http.delete<void>(url);
  }


}