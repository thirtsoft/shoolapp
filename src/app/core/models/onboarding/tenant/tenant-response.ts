import { RecordStatus } from "../record-status";

export interface TenantResponse {
  uuid: string;

  libelle: string;

  code: string;

  domaine: string;

  currencyLibelle: string;

  languageLibelle: string;

  timezoneLibelle: string;

  countryLibelle: string;

  email: string;

  emailContact: string

  mobile: string;

  mobileContact: string;

  telephone: string;

  adresse: string;

  recordStatus: RecordStatus;

}