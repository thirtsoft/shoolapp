import { Besoin } from './besoin-request';
import { Etablissement } from './etablissement-request';
import { Responsable } from './responsable-request';

export interface DemandeDemoRequest {

  etablissement?: Etablissement;

  responsable?: Responsable;

  besoin?: Besoin;

  message?: string;

  consentement?: boolean;

}