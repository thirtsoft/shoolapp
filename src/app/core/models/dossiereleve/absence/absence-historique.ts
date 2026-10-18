export interface AbsenceHistorique {
  id: number;
  eleveId: number;
  eleveNom?: string;
  elevePrenom?: string;
  attendanceDate: string;
  status: AttendanceStatus;
  justified: boolean;
  justificationReason?: string;
  lateMinutes?: number;

}

export type AttendanceStatus = 'PRESENCE' | 'ABSENCE' | 'RETARD'| 'EXCLUSION';