import { DetailsNote } from "../note/details-note";


export interface DetailsComposition {

  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  dateCreation?: Date;

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
