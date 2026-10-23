export interface DetailsConges {
  id?: number;
  personnel: string;
  etat?: string;
  objet?: string;
  motif?: string;
  motifRejet?: string;
  demandeur?: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
  dateCreation?: Date;

}