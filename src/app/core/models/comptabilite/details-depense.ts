import { PieceJointe } from "../piecejointe/piece-jointe";

export interface DetailsDepense {

  id: number | null;

  numeroDepense?: string;

  designation?: string;

  typeDepense: string | null;

  montantDepense?: number;

  modePaiement: string | null;


  reference?: string;

  dateDepense?: Date;

  nomCompletCreateur?: string;

  actif?: number;

  piecesJointesDTO?: PieceJointe;
}

