import { CompteUtilisateurRequest } from "./compte-utilisateur-request.model";

export interface PersonnelRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  cni: string;
  address: string;
  matricule: string;
  typePersonnelUuid: string;
  dateDebutService: Date;
  dateFinService: Date;
  statut: string;
  eligiblePaie: boolean;
  compteUtilisateur?: CompteUtilisateurRequest;
}