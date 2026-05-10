import { Salle } from "./salle";


export interface Batiment {
    id?: number;

    libelle?: string;

    salleDTOList?: Salle[];

    ecole?: number;

}