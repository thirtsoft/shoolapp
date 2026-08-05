import { RecordStatus } from "./record-status";

export interface OrganizationTypeResponse {

  id: number;

  uuid: string;

  version: number;

  code: string;

  libelle: string;

  description: string;

  niveau: number;

  peutAvoirEnfant: boolean;

  recordStatus: RecordStatus;

  createdAt: string;

  updatedAt: string;

}