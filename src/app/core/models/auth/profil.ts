import { Action } from "./action";

export interface Profil {
    id?: number;
    code?: string;
    libelle?: string;
    createdDate?: Date;
    actionListDs?: Action[];
}
