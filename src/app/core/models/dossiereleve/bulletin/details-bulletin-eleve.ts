import { BulletinMatiereDetails } from "./bulletin-matiere-details";


export interface DetailsBulletinEleve {
    id?: number;

    nomCompletEleve?: string;

    dateNaissanceEleve?: string;

    lieuNaissanceEleve?: string;

    nomCompletEnseignant?: string;

    classe?: string;

    anneeScolaire?: string;

    semestre?: string;

    dateCreation?: string;

    appreciation_general?: string;

    moyenne_eleve?: number;

    moyenne_classe?: number;

    nombre_eleve?: number;

    bulletinMatiereDetailsDTOS?: BulletinMatiereDetails[];

    actif?: number;
}