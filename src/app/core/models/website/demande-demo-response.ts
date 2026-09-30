import { DemandeDemoStatut } from './demande-demo-statut';

export interface DemandeDemoResponse {
  uuid?: string;
  numeroDemande?: string;
  etablissementNom?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  statutDemande?: DemandeDemoStatut;

}