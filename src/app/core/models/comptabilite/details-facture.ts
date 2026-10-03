import { Eleve } from "../dossiereleve/request/eleve";
import { DetailsLigneFacture } from "./details-ligne-facture";

import { PaiementFacture } from "./paiement-facture";


export interface DetailsFacture {
  id?: number;

  numeroFacture?: string;

  montant?: number;

  dateFacture?: Date;

  datePayement?: Date;

  etat?: string;

  modePaiement?: string;

  montantPayement?: number;

  eleve?: Eleve;

  detailsLigneFactureDTOS?: DetailsLigneFacture[];

  paiements?: PaiementFacture[];

  mois?: number;

  annee?: number;

  remise?: number;

  echeanceDate?: Date;

  anneeScolaire?: string;
}

