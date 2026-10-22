import { DetailsEntreeCahierTexteResponse } from "./details-entrees-cahiers-texte-response.model";

export interface EntreeCahierTextePageResponse {

  content: DetailsEntreeCahierTexteResponse[];

  page?: number;

  size?: number;

  totalElements?: number;

  totalPages?: number;

  first?: number;

  last?: number;

}
