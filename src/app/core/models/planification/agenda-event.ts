export interface AgendaEvent {
    id?: string;

    date?: Date;

    startTime?: string;

    endTime?: string;

    type?: string;

    title?: string;

    className?: string;

    matiereName?: string;

    room?: string;

    isAllDay?: boolean;

}