import { Profil } from "./profil";

export interface Utilisateur {
    id?: number;
    codeUtilisateur?: string;
    name?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    dateCreation?: Date;
    activation?: string;
    createdBy?: number;
    profileCode?: string;
    dateRecrutement?: Date;
    sexe?: string;
    civilite?: string;
    fonction?: string;
    matricule?: string;
    adresse?: string;
    typeUtilisateur?: string;
    education?: string;
    experience?: string;
    speciality?: string;
    creationDate?: Date;
    lastModifiedDate?: Date;
    createdByUser?: string;
    typeCompte?: string;
    actif?: boolean;

    profilDs?: Profil;
}
