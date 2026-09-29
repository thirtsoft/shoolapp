export interface PaiementFacture {
  id?: number;

  montant?: number;

  datePaiement?: Date;

  moyenPaiement?: string;

  etat?: string;

  numeroRecu?: string;

  reference?: string;
}

