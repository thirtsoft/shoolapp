import { DetailsNote } from "../note/details-note";


export interface DetailsDevoir {

  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  nomCompletEnseignant?: string;

  type?: string;

  etat?: string;

  heureDebut?: string;

  heureFin?: string;

  libelleClasse?: string;

  anneeScolaire?: string;

  semestre?: string;

  matiere?: string;

  actif?: number;

  detailsNoteEleveDTOList?: DetailsNote[]

}
