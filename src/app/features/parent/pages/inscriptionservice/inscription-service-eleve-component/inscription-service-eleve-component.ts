import { Component, inject, OnInit } from '@angular/core';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { ComptabiliteResourceService } from '../../../../comptabilite/services/comptabilite-resource.service';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';

@Component({
  selector: 'app-inscription-service-eleve-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './inscription-service-eleve-component.html',
  styleUrl: './inscription-service-eleve-component.css',
})
export class InscriptionServiceEleveComponent implements OnInit {

  isLoading: boolean = false;
  filteredInscritionServiceData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  inscriptionServiceData: any = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  etatfactureOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesInscriptionServicesEleve();

  }

  async chargerLesInscriptionServicesEleve() {
    try {
      await Promise.all([
        this.getMoisList(),
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMoisList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllMois().subscribe({
        next: (data) => {
          this.moisList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        }))
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

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireLesParamereDeFiltre();

      apiCall = this.comptabiliteResource.fetchFilterByElementDataTable(
        'eleveservice/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourceByIdPaged('eleveservice/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.inscriptionServiceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

         this.columns = [
          { key: 'eleve', header: 'Elève' },
          { key: 'libelleClasse', header: 'Classe' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'dateInscription', header: 'Date' },
        ];

        this.inscriptionServiceData = this.inscriptionServiceData.map((item: any) => ({
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

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
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
