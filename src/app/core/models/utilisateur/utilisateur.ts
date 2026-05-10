import { Profil } from "../profil/profil";

export interface Utilisateur {
    id?: number;

    nom?: string;

    prenom?: string;

    username?: string;

    telephone?: string;

    email?: string;

    address?: string;

    profession?: string;

    civility?: string;

    profilDTO?: Profil;
}