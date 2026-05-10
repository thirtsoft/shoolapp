import { Facture } from "./facture";

export interface LigneFacture {
  id?: number;

  numeroFacture?: string;

  typeService?: number;

  montant?: number;

  facture?: number;

}