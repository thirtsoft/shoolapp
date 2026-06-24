import { Action } from "./action";
import { TypeCompte } from "./typecompte";

export interface Profil {
    id?: number;
    typeCompte?: string;
    libelle?: string;
    createdDate?: Date;
    actionDTOs?: Action[];

    typeCompteDTO?: TypeCompte;

    typeCompteId?: number;
    
}
