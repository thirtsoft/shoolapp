import { RecordStatus } from "../onboarding/record-status";

export interface DemandeAvanceSalairePaieResponse {
  uuid: number;
  numeroDemande: string;
  montant: number;
  dateDemande: Date;
  motif: string;
  etatLibelle: string;
  dateDecision: Date;
  commentaireDecision: string;
  recordStatus: RecordStatus;

}
