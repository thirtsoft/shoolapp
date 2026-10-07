import { RecordStatus } from "../onboarding/record-status";

export interface PaieResponse {
  uuid: number;
  personnelUuid: string;
  contratUuid: string;
  annee: number;
  mois: number;
  nombreHeures: number;
  tarifHoraire: number;
  montantBrut: number;
  retenues: number;
  netAPayer: number;
  etatUuid: string;
  dateCalcul: Date;
  dateValidation: Date;
  demandeAvanceUuid: string;
  observation: string;
  montantPaye: number;
  resteAPayer: number;
  recordStatus: RecordStatus;
  actif: number;

}