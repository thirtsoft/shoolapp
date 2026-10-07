import { RecordStatus } from "../onboarding/record-status";

export interface TypeContratResponse {
  uuid: number;

  libelle: string;

  code: string;

  recordStatus: RecordStatus;

  actif: number;

}