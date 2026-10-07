import { RecordStatus } from "../onboarding/record-status";

export interface DemandeAvanceSalaireResponse {
  uuid: number;
  personnelUuid: string;
  numeroDemande: string;
  montant: number;
  dateDemande: Date;
  motif: string;
  etatUuid: string;
  etatCode: string;
  dateDecision: Date;
  decideParUserUuid: string;
  commentaireDecision: string;
  paieUuid: string;
  resteAPayer: number;
  recordStatus: RecordStatus;
  actif: number;

}