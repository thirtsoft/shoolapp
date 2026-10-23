import { DetailsEntreeCahierTexteResponse } from "./details-entrees-cahiers-texte-response.model";

export interface CahierDeTexteDetailsResponse {

  id?: number;

  numero?: string;

  classeUuid?: string;
  classe?: string;

  anneeScolaireUuid?: string;
  anneeScolaire?: string;

  etatUuid?: string;
  etat?: string;

  dateCreation?: string;

  actif?: boolean;

  recordStatus?: string;

  entrees?: DetailsEntreeCahierTexteResponse[];

  totalEntrees?: number;

}
