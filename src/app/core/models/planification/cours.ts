import { Classe } from "../referentiels/classe";
import { Matiere } from "../referentiels/matiere";
import { Utilisateur } from "../utilisateur/utilisateur";

export interface Cours {
    id?: number;

    libelle?: string;

    motif?: string;

    enseignant?: Utilisateur;

    classe?: Classe;

    matiere?: Matiere;

    dateDebut?: Date;

    heureDebut?: string;

    heureFin?: string;

    ecole?: number;

}

export interface CoursEdit {
    id?: number;

    libelle?: string;

    enseignement?: number;

    enseignant?: number;

    matiere?: number;

    salle?: number;

    emploiDuTemps?: number;

    dateCours?: Date;

    dateDebut?: Date;

    heureDebut?: string;

    heureFin?: string;

    ecole?: number;

}