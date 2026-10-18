export interface AttendanceRecordResponse {
  id: number;
  eleveId: number;
  anneeScolaireId: number;
  courseId: number;
  sessionSemestreId?: number;
  attendanceDate: string;
  status: 'PRESENCE' | 'ABSENCE' | 'RETARD' | 'EXCLUSION';
  attendanceSource: string;
  justified: boolean;
  justificationReason?: string;
  arrivalTime?: string;
  lateMinutes?: number;
  declaredByUserUuid: string;
  declarationDate: string;
}