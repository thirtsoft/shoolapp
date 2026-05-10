import { MedecinTraitant } from "./request/medecin-traitant";
import { ListeInscription } from "./request/liste-inscription";
import { Paiement } from "./request/paiement";
import { ListNote } from "./list-note";


export interface DetailsEleveParent {
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

    listNoteDTOS?: ListNote[];

    listeInscriptionDTOS?: ListeInscription[];

    paiementDTOList?: Paiement[];

    actif?: number;
}