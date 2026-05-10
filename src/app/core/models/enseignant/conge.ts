import { Utilisateur } from "../utilisateur/utilisateur";

export interface Conge {
    id?: number;

    objet?: string;

    motif?: string;

    enseignantDTO?: Utilisateur;

    etat?: number;

    dateDebut?: Date;

    dateFin?: Date;
}