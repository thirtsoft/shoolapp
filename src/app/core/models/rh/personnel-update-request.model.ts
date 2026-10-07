export interface PersonnelUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  cni: string;
  address: string;
  matricule: string;
  typePersonnelUuid: string;
  userUuid: string;
  dateDebutService: Date;
  dateFinService: Date;
  statut: string;
  eligiblePaie: boolean;
}