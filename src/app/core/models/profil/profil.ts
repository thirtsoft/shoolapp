import { Action } from "./action";

export interface Profil {
    id?: number;
    typeCompte?: string;
    libelle?: string;
    createdDate?: Date;
    actionDTOs?: Action[];
}
