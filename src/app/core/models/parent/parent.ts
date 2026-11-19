
import { Profil } from "../profil/profil";
import { UtilisateurRequest } from "../request/utilisateur-request";
import { Utilisateur } from "../utilisateur/utilisateur";

export interface Parent {
    id?: number;

    userId?: number;

    nom?: string;

    prenom?: string;

    telephone?: string;

    email?: string;

    typeParent?: string;

    matricule?: string;

    civility?: string;

    address?: string;

    profession?: string;

    username?: string;

    utilisateurDTO?: Utilisateur;

    eleves?: Eleve[];

    profil?: Profil;

}


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

    parentDTOs?: Parent[];

    utilisateurDTOS?: UtilisateurRequest[];

    utilisateurDTOs?: UtilisateurRequest[];

    matricules?: string[];

    telephones?: string[];

    parentExist?: boolean;
}

export interface ParentUtilisateurAddEdit {
    id?: number;

    parentUuid?: string;

    civility?: string;

    nom?: string;

    prenom?: string;

    profession?: string;

    address?: string;

    telephone?: string;

    email?: string;
}

export interface ParentMini {
    id?: number;

    uuid?: string;

    userUuid?: string;

    matricule?: string;

    nom?: string;

    prenom?: string;

    telephone?: string;
}



export interface MedecinTraitant {
    id?: number;

    matricule?: string;

    nom?: string;

    prenom?: string;

    telephone?: string;

    email?: string;
}