import { Paiement } from "../comptabilite/paiement";
import { Utilisateur } from "../utilisateur/utilisateur";
import { ListeInscription } from "./request/liste-inscription";
import { MedecinTraitant } from "./request/medecin-traitant";


export interface DetailsEleve {
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

    utilisateurDTOS?: Utilisateur[];

    listeInscriptionDTOS?: ListeInscription[];

    paiementDTOList?: Paiement[];

}