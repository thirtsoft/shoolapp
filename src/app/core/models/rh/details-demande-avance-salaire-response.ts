import { RecordStatus } from "../onboarding/record-status";

export interface DetailsDemandeAvanceSalaireResponse {
  uuid: number;
  numeroDemande: string;
  beneficiaire?: string;
  creePar?: string;
  approuverPar?: string;
  montant: number;
  dateDemande: string;
  dateApprobation?: string;
  motif: string;
  etat: string;
  dateDecision: Date;
  motifRejet?: string;
  commentaireValidation: string;
  recordStatus: RecordStatus;

}
