import { RecordStatus } from "../onboarding/record-status";

export interface ContratPaieResponse {
  uuid: number;
  reference: string;
  typeContratCode: string;
  typeContratLibelle: string;
  modeRemuneration: string;
  montantReference: number;
  recordStatus: RecordStatus;
  statut: string;

}
