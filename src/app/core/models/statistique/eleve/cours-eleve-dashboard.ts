import { CoursEleve } from "./cours-eleve";

export interface CoursEleveDashboard {
  semaine?: string;
  jour?: string;
  coursEleveDTOList?: CoursEleve[];
  creneaux?: CoursEleve[];


}