export interface InscriptionRequest {
    id?: number;

    code?: string;

    eleveId?: number;

    anneeScolaireId?: number;

    classeId?: number;

    moyenPaiement?: number;

    montantInscription?: number;

    montantRecu?: number;

    dateInscription?: Date;

    createdBy?: number;

    reference?: string;
}