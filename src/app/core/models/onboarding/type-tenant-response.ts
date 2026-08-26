import { RecordStatus } from "./record-status";

export interface TenantTypeResponse {

  id: number;

  uuid: string;

  version: number;

  code: string;

  libelle: string;

  description: string;

  maxOrganization: number;

  autoCreateOrganization: boolean;

  recordStatus: RecordStatus;

  createdAt: string;

  updatedAt: string;
}