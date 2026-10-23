import { AttendanceRecordRequest } from "./attendance-record-request";

export interface FaireAppelRequest  {
  courseId: number;
  anneeScolaireId: number;
  sessionSemestreId?: number;
  attendanceDate: string;
  presences: AttendanceRecordRequest[];
}