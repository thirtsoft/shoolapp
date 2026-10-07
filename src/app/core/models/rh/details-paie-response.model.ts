import { RecordStatus } from "../onboarding/record-status";
import { ContratPaieResponse } from "./contrat-paie-response.model";
import { ContratPersonnelResponse } from "./contrat-personnel-response.model";
import { DemandeAvanceSalairePaieResponse } from "./demande-avance-salaire-paie-response.model";
import { PaiementPaieResponse } from "./paiement-paie-response.model";

export interface DetailsPaieResponse {
  uuid: number;
  numeroPaie: string;
  annee: string;
  mois: string;
  type: string;
  nombreHeures: number;
  tarifHoraire: number;
  montantBrut: number;
  retenues: number;
  netAPayer: number;
  montantDejaPaye: number;
  montantRestantAPayer: number;
  etatLibelle: string;
  dateCalcul: string;
  dateValidation: string;
  observation: string;
  recordStatus: RecordStatus;
  personnelResponse: ContratPersonnelResponse;
  contratPaieResponse: ContratPaieResponse;
  demandeAvanceSalairePaieResponse: DemandeAvanceSalairePaieResponse;

  paiementsPaieResponses: PaiementPaieResponse[];


}
