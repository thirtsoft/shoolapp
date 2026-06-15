import { ActiviteAvenirEnseignant } from "./activite-a-venir-enseignant";
import { CoursJourEnseignant } from "./cours-jour-enseignant";
import { NoteASaisirEnseignant } from "./note-a-saiair-enseignant";
import { ResponsabiliteClasseEnseignant } from "./responsabilite-classe-enseignant";

export interface EnseignantDashboardListData {
  coursDuJour?: CoursJourEnseignant[];
  mesResponsabilites?: ResponsabiliteClasseEnseignant[];
  notesASaisir?: NoteASaisirEnseignant[];
  activitesAvenir?: ActiviteAvenirEnseignant[];


}