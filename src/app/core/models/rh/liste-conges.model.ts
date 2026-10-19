export interface ListeConges {
  personnelUuid: string;
  objet?: string;
  motif?: string;
  description?: string;
  etat?: string;
  dateDebut: Date;
  dateFin: Date;
  dateCreation?: Date;

}