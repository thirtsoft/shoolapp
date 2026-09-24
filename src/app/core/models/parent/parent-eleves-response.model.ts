
import { EleveResume } from "../dossiereleve/eleve/eleve-resume.model";

export interface ParentElevesResponse {
    id?: number;

    parentUuid?: string;

    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    profession?: string;
    civility?: string;

    eleves: EleveResume[];
}