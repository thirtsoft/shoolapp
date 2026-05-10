
export interface Enseignement {
  id?: number;
  description?: string;
  enseignant?: number;
  classe?: number;
  anneeScolaire?: number;
  matiere?: number;
  dateDebut?: Date;
  actif?: number;
  dateFin?: Date;
}

export interface DetailsEnseignement {
  id?: number;
  description?: string;
  enseignantId?: number;
  classeId?: number;
  anneeScolaireId?: number;
  enseignant?: string;
  classe?: string;
  anneeScolaire?: string;
  actif?: number;
  dateDebut?: string;



}