import { DetailsEleveParent } from "../dossiereleve/details-eleve-parent";

export interface ParentDetails {
    id?: number;

    nom?: string;

    prenom?: string;

    address?: string;

    telephone?: string;

    email?: string;

    profession?: string;

    civility?: string;

   detailsEleveParentDTOS?: DetailsEleveParent[];

    eleveParentDTOList?: DetailsEleveParent[];

    
    active?: boolean;

}