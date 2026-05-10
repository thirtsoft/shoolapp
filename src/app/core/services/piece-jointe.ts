import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PieceJointe } from '../piecejointe/piece-jointe';

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


}