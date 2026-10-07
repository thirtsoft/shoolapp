export interface ContratRequest {
  reference: string;
  personnelUuid: string;
  typeContratUuid: string;
  modeRemuneration: 'MENSUEL' | 'HORAIRE';
  montantReference: number;
  dateDebut: string;
  dateFin?: string;
  statut?: string;
  observation?: string;
}