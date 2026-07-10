import { Facture } from "../comptabilite/facture";
import { InscriptionEleveTypeService } from "../comptabilite/inscrire-eleve-service";
import { PieceJointe } from "../piecejointe/piece-jointe";
import { Utilisateur } from "../utilisateur/utilisateur";
import { AttendanceRecord } from "./absence/attendanceRecordedit";
import { ListeBulletin } from "./bulletin/liste-bulletin";
import { Note } from "./note";
import { Eleve } from "./request/eleve";
import { Inscription } from "./request/inscription";


export interface DetailsDossierEleve {
  id?: number;

  eleve?: Eleve;

  tuteurs?: Utilisateur[];
  notes?: Note[];
  bulletins?: ListeBulletin[];
  absencesEtRetards?: AttendanceRecord[];

  totalAbsences?: number;

  totalRetardsMinutes?: number;

  totalAbsencesJustifiees?: number;

  historiqueInscriptions?: Inscription[];

  servicesSouscrits?: InscriptionEleveTypeService[];

  factures?: Facture[];

}

export interface EleveData {
  eleve: {
    id: number;
    matriculeEleve: string;
    sexe: string;
    nom: string;
    prenom: string;
    address: string;
    nationalite: string;
    lieuNaissance: string;
    dateNaissance: string;
    piecesJointesDTO?: PieceJointe;
    actif: boolean;
  };
  tuteurs: Array<{
    id: number;
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
    profession: string | null;
  }>;
  notes: Array<{
    id: number;
    note: number;
    type: string;
    actif: number;
  }>;
  bulletins: any[];
  absencesEtRetards: Array<{
    id: number;
    attendanceDate: string;
    attendanceStatus: string;
    lateMinutes: string;
    justified: boolean;
  }>;
  totalAbsences: number;
  totalRetardsMinutes: number;
  totalAbsencesJustifiees: number;
  historiqueInscriptions: Array<{
    id: number;
    code: string;
    montantInscription: number;
    dateInscription: string;
    actif: number;
  }>;
  servicesSouscrits: Array<{
    id: number;
    dateInscription: string;
    remise: number;
    actif: number;
  }>;
  factures: Array<{
    id: number;
    numeroFacture: string;
    montant: number;
    dateFacture: string;
    mois: string;
    annee: string;
    etat: string | null;
  }>;
}