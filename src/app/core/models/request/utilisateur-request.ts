import { Profil } from "../profil/profil";
import { Utilisateur } from "../utilisateur/utilisateur";


export interface UtilisateurRequest {
    id?: number;
    motdepasse?: string;
    username?: string;
    profilDTO?: Profil;
    nom?: string;
    prenom?: string;
    address?: string;

    telephone?: string;
    email?: string;
    civility?: string;
    profession?: string;
    typeParent?: string;
    utilisateurDTO?: Utilisateur;
}