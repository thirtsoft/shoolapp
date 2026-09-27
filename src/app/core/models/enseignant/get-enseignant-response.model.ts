import { PhotoEleveResponse } from "../dossiereleve/eleve/photo-eleve-response.model";

export interface GetEnseignantResponse {

    id: number;

    enseignantUuId: string;

    matricule: string;

    firstName: string;

    lastName: string;

    email: string;

    mobile: string;

    address: string;

    cni: string;

    situationMatrimoniale: string;

    dateDebut: Date;

    dateFin: Date;

    niveauEducation: number;

    photo: PhotoEleveResponse;

}