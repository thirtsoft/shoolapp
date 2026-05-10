
export interface ListeDevoir {
  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  enseignement?: string;

  matiere?: string;

  classe?: string;

  semestre?: string;

  anneeScolaire?: string;

  typeEvaluation?: string;

  etat?: string;

  heureDebut?: string;

  heureFin?: string;

  actif?: number;


}