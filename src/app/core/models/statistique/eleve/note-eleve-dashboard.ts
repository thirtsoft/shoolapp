import { NoteEleve } from "./note-eleve";

export interface NoteEleveDashboard {
  trimestre?: string;
  moyenne?: number;
  rang?: number;
  effectif?: number;
  decision?: string;
  noteEleveDTOList?: NoteEleve[];
}