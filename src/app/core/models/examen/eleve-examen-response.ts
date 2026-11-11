export interface GenererExamenRequest {
  anneeScolaireUuid: string;
}

export interface ExamenResponse {
  uuid: string;
  code: string;
  libelle: string;
  description: string;
  niveauUuid: string;
  libelleNiveau: string;
  anneeScolaireUuid: string;
  libelleAnneeScolaire: string;
  etatUuid: string;
  libelleEtat: string;
  nombreEleves: number;
  nombreResultats: number;
}

export type ResultatExamenStatut =
  | 'ADMIS'
  | 'AJOURNE'
  | 'ABSENT';

export interface EleveExamenResponse {
  eleveUuid: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: string;
  classeUuid: string;
  libelleClasse: string;
  resultatExamenStatut: ResultatExamenStatut | null;
}

export interface ResultatExamenItemRequest {
  eleveUuid: string;
  resultatExamenStatut: ResultatExamenStatut;
}

export interface RenseignerResultatsExamenRequest {
  examenUuid: string;
  resultats: ResultatExamenItemRequest[];
}

export interface ExamenDetailsResponse {
  uuid: string;
  code: string;
  libelle: string;
  description: string;
  niveauUuid: string;
  libelleNiveau: string;
  anneeScolaireUuid: string;
  libelleAnneeScolaire: string;
  etatUuid: string;
  libelleEtat: string;
  nombreEleves: number;
  nombreResultats: number;
  nombreAdmis: number;
  nombreAjournes: number;
  nombreAbsents: number;
  progression: number;
  pourcentageReussite: number;
  eleves: EleveExamenResponse[];
}

