import { SetupSemestreRequest } from "./setup-semestre-request.model";

export interface SetupPeriodeScolaireRequest {

  periodicite: string;

  semestres: SetupSemestreRequest[];

}