import { TypeServiceOffert } from "../referentiels/type-service-offert";

export interface InscriptionEleveTypeService {
  id?: number;

  typeServiceOffertDTOList?: TypeServiceOffert[];

  dateInscription?: Date;

  eleve?: number;

  classId?: number;

  anneeScolaire?: number;

  benefice_remise?: number;

  remise?: number;

}