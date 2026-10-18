export interface AttendanceRecordRequest {
  eleveId?: number;
  anneeScolaireId?: number;
  courseId?: number;
  sessionSemestreId?: number;
  attendanceDate?: string;
  status?: 'PRESENCE' | 'ABSENCE' | 'RETARD' | 'EXCLUSION';
  justified?: boolean;
  justificationReason?: string;
  arrivalTime?: string;
  lateMinutes?: number;
}