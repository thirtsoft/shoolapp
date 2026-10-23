export interface EntreeCahierTexteRequest {

  cahierTexteId: number | null;

  coursUuid?: string | null;

  dateSeance?: Date;

  contenu: string[];

  observation?: string;

}
