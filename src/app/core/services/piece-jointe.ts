import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PieceJointe } from '../piecejointe/piece-jointe';
import { ResponseMessage } from '../response/response-message';

@Injectable({
  providedIn: 'root'
})
export class PieceJointeService {

  pieceJointeUrl = environment.apiBaseUrl;

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

    console.log('📤 Upload pièce jointe:');
    console.log('URL:', url);
    console.log('Fichier:', file.name, 'Type:', file.type, 'Taille:', file.size);

    // Ne PAS définir le Content-Type, laisser le navigateur gérer le multipart
    return this.http.put<ResponseMessage>(url, formData).pipe(
      catchError((error) => {
        console.error('❌ Erreur upload pièce jointe:', error);
        return throwError(() => error);
      })
    );
  }

  supprimerPieceJointe(id: number) {
    const url = `${this.pieceJointeUrl}/ged/piecejointes/${id}`;
    return this.http.delete<void>(url);
  }


}