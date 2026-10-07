import { RecordStatus } from "../onboarding/record-status";

export interface ContratPersonnelResponse {
  uuid: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  cni: string;
  address: string;
  matricule: string;
  statut: string;
  eligiblePaie: boolean;
  recordStatus: RecordStatus;

}