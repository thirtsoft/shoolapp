import { LogoOrganizationResponse } from "./logo-organization-response";

export interface OrganizationMiniResponse {
  id?: number;
  uuid?: string;
  code?: string;
  libelle?: string;
  sigle?: string;
  adresse?: string;
  boitePostale?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  slogan?: string;
  anneeCreation?: number;
  status?: string;
  logo?: LogoOrganizationResponse;
  inspectionAcademique?: string;
  inspectionEduFormation?: string;


}