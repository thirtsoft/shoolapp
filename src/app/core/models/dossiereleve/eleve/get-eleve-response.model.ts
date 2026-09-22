import { PhotoEleveResponse } from "./photo-eleve-response.model";

export interface GetEleveResponse {
  id: number;
  uuid: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: string;
  lieuNaissance: string;
  address: string;
  nationalite: string;
  dateNaissance: string;
  allergies: string[];
  photo: PhotoEleveResponse;

}