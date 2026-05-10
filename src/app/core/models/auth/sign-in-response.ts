import { ProfilResponse } from "./profil-response";

export interface SignInResponse {
    id: number;
    name: string;
    typeCompte: string;
    prenom: string;
    token: string;
    email: string;
    profilReponse: ProfilResponse;
}
