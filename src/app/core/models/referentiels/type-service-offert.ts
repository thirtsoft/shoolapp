
export interface TypeServiceOffert {
  id?: number;

  libelle?: string;
}


export interface ListTypeServiceTarif {
  id?: number;

  classe?: string;

  classeId?: number;

  typeServiceId?: number;

  typeService?: string;

  montant?: number;

  actif?: number;

}