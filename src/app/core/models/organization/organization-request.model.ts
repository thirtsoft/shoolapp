import { SchoolType } from "./school-type";

export interface OrganizationRequest {
  uuid?: string;
  tenantUuid?: string;
  organizationTypeUuid?: string;
  parentUuid?: string;
  code?: string;
  libelle?: string;
  sigle?: string;
  adresse?: string;
  countryUuid?: string;
  regionUuid?: string;
  departmentUuid?: string;
  boitePostale?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  logoFileUid?: string;
  schoolType?: SchoolType;
  regionCode?: string;
  departmentCode?: string;
  creationDate?: Date;
  anneeCreation?: number;

}