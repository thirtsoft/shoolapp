import { Matiere } from "../referentiels/matiere";
import { Semestre } from "../referentiels/semestre";
import { Eleve } from "./request/eleve";


export interface Note {
    id?: number;

    eleve?: Eleve;

    matiere?: Matiere;

    semestre?: Semestre;

    type?: string;

    note?: number;

    ecole?: number;
}

export interface NoteEdit {
    id?: number;

    eleve?: number;

    classe?: number;

    evaluation?: number;

    appreciation?: string;

    type?: string;

    note?: number;

    createur?: number;

    ecole?: number;

}