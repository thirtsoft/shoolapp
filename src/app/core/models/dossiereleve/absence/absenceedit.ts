export interface AbsenceEdit {
  id?: number;

  eleveId?: number;

  anneeScolaireId?: number;

  semestre?: number;

  motif?: string;

  justifiee?: number;

  typeSignalement?: string;

  date_declaration?: Date;

  dateAbsence?: Date;

  createur?: number;

  classId?: number;

  ecole?: number;

}