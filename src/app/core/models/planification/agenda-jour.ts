import { AgendaEvent } from "./agenda-event";

export interface AgendaJour {
    id?: number;

    date?: Date;
    dateLabel?: string;
    agendaEventDTOList?: AgendaEvent[];
}