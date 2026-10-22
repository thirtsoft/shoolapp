export interface EntreeCahierTexteResponse {

  id: number;

  cahierTexteId: number;

  coursUuid?: string;

  enseignantUuid: string;

  dateSeance: string;

  contenu: string[];

  observation?: string;

}
