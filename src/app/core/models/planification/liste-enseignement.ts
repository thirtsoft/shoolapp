
export interface ListeEnseignement {
  id?: number;
  description?: string;
  enseignant?: string;
  classe?: string;
  classeUuid: string;
  anneeScolaireId?: number;
  anneeScolaire?: string;
  anneeScolaireUuid: string;
  matiere?: string;
  dateDebut?: Date;
  actif?: number;
  classId?: number;
}