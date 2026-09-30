import { SchoolType } from "../../organization/school-type";

export interface OrganizationUpdateConfigInformationRequest {
  schoolType: SchoolType;
  code: string;
  libelle: string;
  sigle: string;
  countryUuid: string;
  regionUuid: string;
  departmentUuid: string;
  adresse: string;
  boitePostale: string;
  telephone: string;
  mobile: string;
  email: string;
  siteWeb: string;
  anneeCreation: string;
  description: string;
}