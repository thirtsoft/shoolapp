export interface InscriptionEleveAnneeCouranteResponse {
    id: number;
    codeInscription?: string;

    eleveId?: number;
    matriculeEleve?: string;
    nomEleve?: string;
    prenomEleve?: string;


    anneeScolaireId?: number;
    anneeScolaireLibelle?: string;

    classeId?: number;
    classeLibelle?: string;

    etat?: number;
    etatLibelle?: string;

    montantInscription: number;
    montantRecu: number;
    resteARecu: number;

    dateInscription?: string;
    dateValidation?: string;
    actif?: boolean;


}