export interface ServiceEleveResponse {
  typeServiceOffertId: number;
  code: string;
  libelle: string;
  obligatoire: boolean;
  souscrit: boolean;
  tarif: number;
  beneficieRemise: boolean;
  remise: number;
  montantRemise: number;
  montantFinal: number;
  inscriptionServiceId: number | null;
}

export interface ServiceEleveConfiguration {
  typeServiceOffertId: number;
  souscrit: boolean;
  beneficieRemise: number;
  remise: number;
}

export interface InscrireEleveServiceRequest {
  eleveId: number;
  anneeScolaireId: number;
  typeServiceOffertId: number;
  souscrit: boolean;
  beneficieRemise: number;
  remise: number;
}