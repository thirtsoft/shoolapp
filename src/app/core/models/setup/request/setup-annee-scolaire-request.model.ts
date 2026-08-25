export interface SetupAnneeScolaireRequest {

  id: number | null;
  tenantUuid: string;
  organizationUuid: string;
  libelle: string;
  dateDebut: string;
  dateFin: string | null;
}