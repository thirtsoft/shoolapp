export interface CongesResponse {
  id?: number;
  personnelUuid: string;
  etatUuid?: string;
  objet?: string;
  motif?: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
}