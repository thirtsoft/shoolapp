
export interface Devoir {
  id?: number;

  titre?: string;

  description?: string;

  datePublication?: Date;

  dateRemise?: Date;

  enseignementId?: number;

  type?: string;


  etatId?: number;

  heureDebut?: string;

  heureFin?: string;

  actif?: number;

}