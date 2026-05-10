import { DetailsTypeServiceOffert } from "../referentiels/details-type-service-offert";

export interface DetailsLigneFacture {
  id?: number;

  numeroFacture?: string;

  montantRemise?: number;

  montantInitial?: number;

  typeServiceOffertDTO?: DetailsTypeServiceOffert;


}

