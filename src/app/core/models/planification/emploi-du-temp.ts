import { CoursEdit } from "./cours";

export interface EmploiDuTemps {
  id?: number;

  classe?: number;

  semestre?: number;

  semaine?: number;

  coursEditDTOList?: CoursEdit[];

  ecole?: number;


}