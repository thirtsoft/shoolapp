import { ListNote } from "./list-note";
import { ListeInscription } from "./request/liste-inscription";
import { MedecinTraitant } from "./request/medecin-traitant";
import { Paiement } from "./request/paiement";


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

    classeId?: number;        // ← Peut-être optionnel ?
    classeEleve?: string;     // ← Peut-être optionnel ?
    niveauEleve?: string;
    anneeScolaire?: any;
}