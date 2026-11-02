export interface CompteBancaireProjection {

  id?: number;

  banqueUuId?: string;

  banqueCode?: string;

  banqueLibelle?: string;

  libelle?: string;

  numeroCompte?: string;

  soldeInitial?: number;

  dateSoldeInitial?: string;

  recordStatus?: string;
}