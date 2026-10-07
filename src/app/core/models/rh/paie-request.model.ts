export interface PaieRequest {
  personnelUuid: string;
  contratUuid: string;
  annee: number;
  mois: number;
  nombreHeures: number;
  tarifHoraire: number;
  montantBrut: number;
  retenues: number;
  netAPayer: number;
  dateCalcul: Date;
  demandeAvanceUuid: string;
  observation: string;
}