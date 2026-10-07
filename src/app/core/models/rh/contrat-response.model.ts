import { RecordStatus } from "../onboarding/record-status";

export interface ContratResponse {
  uuid: number;
  reference: string;
  personnelUuid: string;
  typeContratUuid: string;
  typeContratCode: string;
  typeContratLibelle: string;
  modeRemuneration: string;
  statut: string;
  montantReference: number;
  dateDebut: Date;
  dateFin: string;
  observation: string;
  pieceJointeUuid: string;
  nomFichier: string;
  recordStatus: RecordStatus;
  actif: number;

}