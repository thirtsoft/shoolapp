import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { RhResourceService } from '../../../services/rh-resource-service';

@Component({
  selector: 'app-tous-fiches-emargement-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './tous-fiches-emargement-component.html',
  styleUrl: './tous-fiches-emargement-component.css',
})
export class TousFichesEmargementComponent implements OnInit {

  errorMessage?: string;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "ficheemargement";
  columns: any = [];
  fichesEmargementsData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly rhResource = inject(RhResourceService);

  ngOnInit(): void {
    this.chargerLesFichesEmargements()
  }

  chargerLesFichesEmargements() {
    this.initialisationDesFiltres();
    this.chargerLesDonnees(false);
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un type contrat'
      },
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(val =>
      val !== null && val !== undefined && val !== ''
    );
    this.currentPage = 0;
    this.chargerLesDonnees(this.hasActiveFilters);
  }

  chargerLesDonneesV1(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.rhResource.fetchFilterDataTable(
        'emargements',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.rhResource.getResourcePaged('emargements', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.fichesEmargementsData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'enseignantNomComplet', header: 'Enseinant' },
          { key: 'mois', header: 'Mois' },
          { key: 'nombreHeuresPrevu', header: 'Heures prévues' },
          { key: 'nombreHeuresEffectue', header: 'Heures réelles' },
          { key: 'etatLibelle', header: 'Etat' },
          { key: 'annee', header: 'Année' },
        ];

        this.fichesEmargementsData = this.fichesEmargementsData.map((item: any) => ({
          ...item,
        }));


        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  chargerLesDonnees(useFilterApi: boolean): void {

    this.isLoading = true;

    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.rhResource.fetchFilterDataTable(
        'emargements',
        this.currentPage,
        this.pageSize,
        filtreParam
      );

    } else {

      apiCall = this.rhResource.getResourcePaged(
        'emargements',
        this.currentPage,
        this.pageSize
      );

    }

    apiCall.subscribe({

      next: (response) => {

        this.fichesEmargementsData = response.data?.content || [];

        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          {
            key: 'enseignantNomComplet',
            header: 'Enseignant'
          },
          {
            key: 'mois',
            header: 'Mois'
          },
          {
            key: 'heuresPrevuesFormatees',
            header: 'Heures prévues'
          },
          {
            key: 'heuresEffectueesFormatees',
            header: 'Heures effectuées'
          },
          {
            key: 'ecartHeures',
            header: 'Écart'
          },
          {
            key: 'etatLibelle',
            header: 'État'
          },
          {
            key: 'annee',
            header: 'Année'
          }
        ];

        this.fichesEmargementsData = this.fichesEmargementsData.map((item: any) => ({
          ...item,

          heuresPrevuesFormatees: this.formaterHeures(item.nombreHeuresPrevu),

          heuresEffectueesFormatees: this.formaterHeures(item.nombreHeuresEffectue),

          comparaisonHeures: this.getLibelleComparaisonHeures(item),

          ecartHeures: this.getLibelleEcartHeures(item),

          classeIndicateurHeures: this.getClasseIndicateurHeures(item)
        }));

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Erreur chargement des fiches :', error);

        this.isLoading = false;

      }

    });
  }


  formaterHeures(valeur: number | null | undefined): string {
    const heuresDecimales = Number(valeur ?? 0);
    const totalMinutes = Math.round(heuresDecimales * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}h${String(minutes).padStart(2, '0')}`;
  }

  calculerEcartHeures(item: any): number {
    const prevues = Number(item.nombreHeuresPrevu ?? 0);
    const effectuees = Number(item.nombreHeuresEffectue ?? 0);
    return Math.round((effectuees - prevues) * 60) / 60;
  }

  getClasseIndicateurHeures(item: any): string {
    const ecart = this.calculerEcartHeures(item);
    if (ecart < 0) {
      return 'hours-below';
    }
    if (ecart > 0) {
      return 'hours-above';
    }
    return 'hours-compliant';
  }

  getLibelleEcartHeures(item: any): string {
    const ecart = this.calculerEcartHeures(item);
    if (ecart < 0) {
      return `🔴-${this.formaterHeures(Math.abs(ecart))}`;
    }
    if (ecart > 0) {
      return `🔵+${this.formaterHeures(ecart)}`;
    }
    return '🟢 Conforme';
  }

  getLibelleComparaisonHeures(item: any): string {
    const effectuees = this.formaterHeures(item.nombreHeuresEffectue);
    const prevues = this.formaterHeures(item.nombreHeuresPrevu);
    return `${effectuees} / ${prevues}`;
  }

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }



}
