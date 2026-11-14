import { AttendanceStatus } from "./absence/attendance-status";

export interface DerniereNoteDTO {
  matiere: string;
  evaluation: string;
  type: string;
  note: number;
  date: string;
}

export interface DernierPaiementDTO {
  numeroRecu: string;
  montant: number;
  datePaiement: string;
  typePaiement: string;
}

export interface DernierePresenceDTO {
  date: string;
  cours: string;
  status: AttendanceStatus;
  justifiee: boolean;
  lateMinutes: number;
}

export interface DernieresInformationsEleveDTO {
  derniereNote?: DerniereNoteDTO | null;
  dernierPaiement?: DernierPaiementDTO | null;
  dernierePresence?: DernierePresenceDTO | null;
}

export interface ParentEleveDTO {
  parentUuid: string;
  nomComplet: string;
  lienParente?: string | null;
  telephone?: string | null;
  email?: string | null;
  responsableLegal?: boolean;
  initiales?: string | null;
}

export interface PhotoEleveResponse {
  content?: string;
  nomTechnique?: string;
  contentType?: string;
}

export interface DetailsEleveResponse {

  eleveUuid: string;

  nomComplet: string;
  matricule: string;
  statut: string;

  dateNaissance?: string | null;
  age?: number | null;
  lieuNaissance?: string | null;
  sexe?: string | null;
  nationalite?: string | null;
  adresse?: string | null;

  anneeScolaireUuid: string;
  anneeScolaireLibelle: string;
  classeUuid: string;
  classeLibelle: string;
  statutInscription: string;
  dateInscription: string;
  dateEntree?: string | null;

  tauxPresence?: number | null;
  nombreAbsences?: number | null;
  nombreRetards?: number | null;

  parents: ParentEleveDTO[];

  dernieresInformations?: DernieresInformationsEleveDTO | null;

  etablissementPrecedent?: string | null;
  origine?: string | null;

  photo?: PhotoEleveResponse | null;
}