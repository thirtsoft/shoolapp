import { QuatreDernierEvenement } from "../quatre-derniers-evenement";
import { CoursEleveDashboard } from "./cours-eleve-dashboard";
import { ListFactureEleveStatut } from "./list-facture-eleve-statut";
import { NoteEleveDashboard } from "./note-eleve-dashboard";

export interface DashboardStatsEleveList {
  noteEleveDashboardDTOList?: NoteEleveDashboard[];
  listFactureEleveStatutDTOList?: ListFactureEleveStatut[];
  coursEleveDashboardDTOList?: CoursEleveDashboard[];
  quatreDernierEvenementDTOList?: QuatreDernierEvenement[];
}