import { RecordStatus } from "./record-status";

export interface RegionResponse {

  id: number;

  uuid: string;

  version: number;

  code: string;

  libelle: string;

  countryId: number;


  recordStatus: RecordStatus;

  countryCode: string;

  countryLibelle: string;

}