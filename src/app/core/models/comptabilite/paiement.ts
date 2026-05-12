import { Eleve } from "../dossiereleve/request/eleve";
import { TypePaiement } from "../referentiels/type-paiement";

export interface PaiementAdd {
  id?: number;

  montant?: number;

  montantFacture?: number;

  datePaiement?: Date;

  mode?: string;

  facture?: number;

  moyenPaiement?: number;

}

export interface Paiement {
  id?: number;

  code?: string;

  eleveDTO?: Eleve;

  mois?: string;

  montant?: number;

  //    typePaiements?: string[];

  typePaiements?: TypePaiement[];

  datePaiement?: Date;

  createdBy?: number;

  nomCompletEleve?: string;
  
}