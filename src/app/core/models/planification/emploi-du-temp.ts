import { CoursEdit } from "./cours";

export interface EmploiDuTemps {
  id?: number;

  classe?: number;

  sessionSemestre?: number;

  anneeScolaire?: number;

  titre?: string;

  semaine?: number;

  coursEditDTOList?: CoursEdit[];

  ecole?: number;

  nomComplet?: string;


}

export interface EmploiDuTempsList {
  id?: number;

  classe?: number;

  sessionSemestre?: number;

  anneeScolaire?: number;

  titre?: string;

  semaine?: number;

  coursEditDTOList?: CoursEdit[];

  ecole?: number;

  nomComplet?: string;

  libelleSemestre?: string;

  libelleClasse?: string;


}