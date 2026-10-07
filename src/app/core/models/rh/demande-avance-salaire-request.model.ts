export interface DemandeAvanceSalaireRequest {
  personnelUuid: string;
  montant: number;
  dateDemande: Date;
  motif: string;

}