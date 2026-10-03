import { RecordStatus } from "../onboarding/record-status";


export interface InscriptionResponse {
    id?: number;
    code?: string;
    reference?: string;
    matriculeEleve?: string;
    nomComplet?: string;
    sexe?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    nationalite?: string;
    anneeScolaire?: string;
    classe?: string;
    niveau?: string;
    serie?: string;
    etat?: string;
    moyenPaiement?: string;
    montantInscription?: number;
    montantRecu?: number;
    resteAPaye?: number;
    motifAnnulation?: string;
    dateInscription?: string;
    dateValidation?: string;
    recordStatus?: RecordStatus;
    actif?: number;

}