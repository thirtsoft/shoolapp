import { UtilisateurRequest } from "../../request/utilisateur-request";
import { MedecinTraitant } from "./medecin-traitant";


export interface Eleve {
    id?: number;

    matricule?: string;

    nom?: string;

    prenom?: string;

    sexe?: string;

    lieuNaissance?: string;

    dateNaissance?: string;

    nationalite?: string;

    address?: string;

    allergies?: string[];

    medecinTraitantDTO?: MedecinTraitant;

    parentDTOs?: any[];

    utilisateurDTOS?: UtilisateurRequest[];

    utilisateurDTOs?: UtilisateurRequest[];

    matricules?: string[];

    telephones?: string[];

    parentExist?: boolean;
}