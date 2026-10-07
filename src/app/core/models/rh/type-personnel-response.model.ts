import { RecordStatus } from "../onboarding/record-status";

export interface TypePersonnelResponse {
  uuid: number;

  libelle: string;

  code: string;

  recordStatus: RecordStatus;

  actif: number;

}