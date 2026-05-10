import { ListeCours } from "./liste-cours";


export interface ListeEmploiDuTemps {
  id?: number;

  semaine?: number;

  libelleSemaine?: string;

  libelleClasse?: string;

  libelleSemestre?: string;

  listeCoursDTOS?: ListeCours[];

}