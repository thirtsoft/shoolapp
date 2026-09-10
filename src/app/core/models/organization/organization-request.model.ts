export interface OrganizationRequest {
  uuid?: string;
  tenantUuid?: string;
  organizationTypeUuid?: string;
  parentUuid?: string;
  code?: string;
  libelle?: string;
  sigle?: string;
  adresse?: string;
  regionUuid?: string;
  departmentUuid?: string;
  boitePostale?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  logoFileUid?: string;
  schoolType?: string;
  regionCode?: string;
  departmentCode?: string;
  creationDate?: Date;
  anneeCreation?: number;
  status?: string;

}