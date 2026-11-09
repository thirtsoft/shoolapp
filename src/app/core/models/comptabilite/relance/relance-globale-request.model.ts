export interface RelanceGlobaleRequest {
  ignorerDoublons: boolean;
}

export interface RelanceGlobaleResponse {
  nombreRelancesCreees: number;
}

export interface RelanceCibleeRequest {
  factureId: number;
  type: TypeRelance;
  message: string;
}

export interface RelanceCreationResponse {
  code: string;
}


export enum TypeRelance {
  ECHEANCE_DEPASSEE = 'ECHEANCE_DEPASSEE',
  PAIEMENT_EN_RETARD = 'PAIEMENT_EN_RETARD',
  PAIEMENT_PARTIEL = 'PAIEMENT_PARTIEL'
}


export interface RelanceParentDashboard {
  type: TypeRelance;
  statut: string;
  montantDu: number;
  joursRetard: number;
  dateEcheance: Date;
  dateRelance: Date;
}