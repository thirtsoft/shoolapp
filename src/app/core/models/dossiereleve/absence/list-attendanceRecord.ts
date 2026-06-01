export interface ListAttendanceRecord {
    id?: number;

    eleve?: number;

    nomCompletEleve?: string;

    sexeEleve?: string;

    anneeScolare?: string;

    semestre?: string;

    course?: string;

    attendanceDate?: Date;

    attendanceStatus?: string;

    attendanceSource?: string;

    actif?: number;

}