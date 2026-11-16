import { DocumentResponse } from "../../piecejointe/document-response.model";
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

export interface ParcoursScolaireEleve {
  inscriptionUuid: string;
  anneeScolaireUuid: string;
  anneeScolaireLibelle: string;
  classeUuid: string;
  classeLibelle: string;
  dateInscription: string;
  statut: string;
  anneeEnCours: boolean;
}

export interface ListeResultatEleve {
  matiere: string;
  evaluation: string;
  type: string;
  note: number;
  date: string;
}

export interface RechercheResultatEleve {
  eleveUuid: string;
  anneeScolaireUuid?: string | null;
  matiereUuid?: string | null;
  type?: string | null;
  mois?: number | null;
}

export interface PresenceEleve {
  presenceUuid: string;
  date: string;
  type: string;
  coursUuid: string | null;
  cours: string | null;
  motif: string | null;
  statut: string;
  dureeRetardMinutes: number | null;
}

export interface RecherchePresenceEleve {
  eleveUuid: string;
  anneeScolaireUuid?: string | null;
  coursUuid?: string | null;
  mois?: number | null;
  type?: string | null;
}

export interface DossierPaiementEleve {
  inscription: InscriptionEleve | null;
  factures: Data<FactureEleve>;
}

export interface Data<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}

export interface InscriptionEleve {
  inscriptionUuid: string;
  anneeScolaireUuid: string;
  anneeScolaire: string;
  classeUuid: string;
  classe: string;
  montantInscription: number;
  montantRecu: number;

}

export interface FactureEleve {
  factureUuid: string;
  numeroFacture: string;
  montant: number;
  etat: string;
  dateFacture: string;
  dateEcheance: string | null;
}

export interface RechercheFactureEleve {
  eleveUuid: string;
  anneeScolaireUuid?: string | null;
  mois?: number | null;
  etatUuid?: string | null;
}

export interface MatiereEnseignee {
  matiereUuid: string;
  matiereLibelle: string;
}

export interface CoursEnseigne {
  coursUuid: string;
  coursLibelle: string;
}

export interface DossierDocumentsEleveResponse {
  documentsGeneres: DocumentGenereResponse;
  documentsStockes: DocumentResponse[];
}

export interface DocumentGenereResponse {
  documentInscriptionResponse: DocumentInscriptionResponse;
  documentBulletinResponse: DocumentBulletinResponse[];
}

export interface DocumentInscriptionResponse {
  id: number;
  eleveUuid: string;
  anneeScolaireLibelle: string;
}

export interface DocumentBulletinResponse {
  id: number;
  eleveUuid: string;
  sessionSemestreCode: string;
  sessionSemestre: string;
  anneeScolaireLibelle: string;
}








