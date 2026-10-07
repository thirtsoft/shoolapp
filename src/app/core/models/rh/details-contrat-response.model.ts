import { DocumentResponse } from "../../piecejointe/document-response.model";
import { RecordStatus } from "../onboarding/record-status";
import { ContratPersonnelResponse } from "./contrat-personnel-response.model";
import { ModeRemuneration } from "./mode-renumeration.model";

export interface DetailsContratResponse {
  uuid: number;
  reference: string;
  personnelUuid: string;
  typeContratCode: string;
  typeContratLibelle: string;
  modeRemuneration: ModeRemuneration;
  statut: string;
  montantReference: number;
  dateDebut: Date;
  dateFin: string;
  observation: string;
  pieceJointeUuid: string;
  recordStatus: RecordStatus;
  actif: number;
  documentResponse: DocumentResponse;
  contratPersonnelResponse: ContratPersonnelResponse;
}