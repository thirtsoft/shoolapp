import { DetailsNote } from "../note/details-note";


export interface DetailsEvaluation {

  id?: number;

  titre?: string;

  description?: string;

  dateCreation?: Date;

  dateEvaluation?: Date;

  dateRemise?: Date;

  dateEnvoi?: Date;

  dateValidation?: Date;

  nomCompletEnseignant?: string;

  evaluationType?: string;

  evaluationMode?: string;

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
