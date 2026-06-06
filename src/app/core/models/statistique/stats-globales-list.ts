import { EleveRetard } from "./eleve-retard";
import { FactureStatut } from "./facture-statut";
import { QuatreDernierEvenement } from "./quatre-derniers-evenement";
import { SexeRepartition } from "./sexe-repartition";

export interface DashboardStatsList {
  factureStatutDTOList?: FactureStatut[];
  eleveRetardDTOList?: EleveRetard[];
  quatreDernierEvenementDTOList?: QuatreDernierEvenement[];
  sexeRepartitionDTOList?: SexeRepartition[];

}