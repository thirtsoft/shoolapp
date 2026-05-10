import { ListTarif } from "./list-tarif";

export interface DetailsTypeServiceOffert {
  id?: number;

  libelle?: string;

  listTarifDTOList?: ListTarif[];

}