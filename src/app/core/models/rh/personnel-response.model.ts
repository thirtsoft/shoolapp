import { RecordStatus } from "../onboarding/record-status";
import { PersonnelCompteUtilisateurResponse } from "./personnel-compte-utilisateur-response.model";

export interface PersonnelResponse {
  uuid: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  cni: string;
  address: string;
  matricule: string;
  typePersonnelUuid: string;
  typePersonnelCode: string;
  typePersonnelLibelle: string;
  userUuid: string;
  dateDebutService: Date;
  dateFinService: Date;
  statut: string;
  eligiblePaie: boolean;
  recordStatus: RecordStatus;
  actif: number;

  compteUtilisateur?: PersonnelCompteUtilisateurResponse;

}