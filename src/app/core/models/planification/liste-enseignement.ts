
export interface ListeEnseignement {
  id?: number;
  description?: string;
  enseignant?: string;
  classe?: string;
  anneeScolaireId?: number;
  anneeScolaire?: string;
  matiere?: string;
  dateDebut?: Date;
  actif?: number;
  classId?: number;
}