import { TypePaiement } from "../../referentiels/type-paiement";
import { Eleve } from "./eleve";


export interface Paiement {
    id?: number;

    code?: string;

    eleveDTO?: Eleve;

    mois?: string;

    montant?: number;

//    typePaiements?: string[];

    typePaiements?: TypePaiement[];

    datePaiement?: Date;

    createdBy?: number;
}