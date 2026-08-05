import { RecordStatus } from "../record-status";

export interface TenantResponse {
  uuid: string;

  libelle: string;

  code: string;

  domaine: string;

  email: string;

  mobile: string;

  telephone: string;

  adresse: string;

  recordStatus: RecordStatus;

}