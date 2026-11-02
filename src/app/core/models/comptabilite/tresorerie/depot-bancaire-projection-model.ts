export interface DepotBancaireProjection {

  id?: number;

  codeDepot?: string;

  dateDepot?: Date;

  compteBancaireId?: number;

  compteBancaireLibelle?: string;

  banqueUuId?: string;

  banqueLibelle?: string;

  montant?: number;

  reference?: string;

  observation?: string;

  enregistreParUuid?: string;

  etatUuid?: string;

  recordStatus?: string;
}