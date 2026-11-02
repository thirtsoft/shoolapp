import { DocumentResponse } from "../../../piecejointe/document-response.model";

export interface DepotBancaireResponse {

  id?: number;

  codeDepot?: string;

  dateDepot?: Date;

  compteBancaireId?: number;

  montant?: number;

  reference?: string;

  observation?: string;

  documentResponse?: DocumentResponse;


}