import { CoefficientMatiereClasse } from "./coefficient-matiere-classe";

export interface Matiere {
    id?: number;

    code?: string;

    libelle?: string;

    ecole?: number;

}

export interface MatiereAvecCoefficient {
    id?: number;

    code?: string;

    libelle?: string;

    couleur?: string;

    ecole?: number;

    coefficientMatiereClasseAddEditDTOList?: CoefficientMatiereClasse[];

    coefficientMatiereAddEditDTOList?: CoefficientMatiereClasse[];

}