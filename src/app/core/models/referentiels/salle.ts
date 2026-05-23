export interface Salle {
  id?: number;

  libelle?: string;

  type_salle?: string;

  capacite?: number;


}

export interface SalleAddEdit {
  id?: number;

  libelle?: string;

  type_salle?: string;

  capacite?: number;

  batimentId?: number;


}