export interface OrganizationResponse {

  id: number;
  uuid: string;
  tenantUuid: string;
  countryUuid?: string;
  regionUuid?: string;
  departmentUuid?: string;
  code: string;
  libelle: string;
  sigle: string;
  adresse: string;
  boitePostale: string;
  mobile: string;
  telephone: string;
  email: string;
  siteWeb: string;
  description: string;
  logoFileUid: string;
  schoolType: string;
  regionCode: string;
  departmentCode: string;
  creationDate: Date;
  anneeCreation: number;
  status: string;

}