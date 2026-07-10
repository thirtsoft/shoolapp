import { PieceJointe } from "../piecejointe/piece-jointe";

export interface DepenseAddEdit {

   id: number | null;

  numeroDepense?: string;

  designation?: string;

  typeDepense: number | null;

  montantDepense: number | null;

  modePaiement: number | null;


  reference?: string;

  dateDepense?: Date;

  createdBy?: number;

  actif?: number;

  piecesJointesDTO?: PieceJointe;
}

export interface Depense {
  id?: number;

  numeroDepense?: string;

  designation?: string;

  typeDepense?: number;

  montantDepense?: number;

  modePaiement?: number;

  reference?: string;

  dateDepense?: Date;

  createdBy?: number;

  actif?: number;

  piecesJointesDTO?: PieceJointe;
}