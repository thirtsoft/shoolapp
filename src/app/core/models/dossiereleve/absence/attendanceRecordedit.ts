export interface AttendanceRecord {
  id?: number;

  eleveId?: number;

  anneeScolaireId?: number;

  semestre?: number;

  courseId?: number;

  justificationReason?: string;

  attendanceStatus?: string;

  attendanceSource?: string;

  declarationDate?: Date;

  attendanceDate?: Date;

  justified?: boolean;

  declaredByUserId?: number;

  classId?: number;

  expectedTime?: number;

  arrivalTime?: number;

  lateMinutes?: number;

  actif?: number;

  ecole?: number;

  classeId?: number;

}