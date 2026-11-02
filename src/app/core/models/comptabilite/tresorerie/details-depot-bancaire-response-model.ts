import { DocumentResponse } from "../../../piecejointe/document-response.model";

export interface DetailsDepotBancaireResponse {
  id?: number;
  codeDepot?: string;
  dateDepot?: string;
  numeroCompteBancaire?: string;
  compteBancaireLibelle?: string;
  banqueLibelle?: string;
  montant?: number;
  reference?: string;
  observation?: string;
  enregistrePar?: string;
  etatLibelle?: string;
  dateCreation?: string;
  documentResponse?: DocumentResponse;
  recordStatus?: string;

}