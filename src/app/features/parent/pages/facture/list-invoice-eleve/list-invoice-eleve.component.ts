import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { ComptabiliteResourceService } from '../../../../comptabilite/services/comptabilite-resource.service';

@Component({
  selector: 'app-list-invoice-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-invoice-eleve.component.html',
  styleUrls: ['./list-invoice-eleve.component.css']
})
export class ListInvoiceEleveComponent implements OnInit {

  isLoading: boolean = false;
  filteredFactureData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  factureData: any = [];

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
    this.chargerLesFacturesEleve();

  }

  async chargerLesFacturesEleve() {
    try {
      await Promise.all([
        this.getStatusFactureList(),
        this.getMoisList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getStatusFactureList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllStatusFactures().subscribe({
        next: (data) => {
          this.etatfactureOptions = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
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
        key: 'numeroFacture',
        label: 'N° facture',
        type: 'text',
        placeholder: 'Rechercher une facture...'
      },
      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatfactureOptions.map(e => ({
          value: e.id,
          label: e.status
        }))
      },
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
        'facture/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourceByIdPaged('facture/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.factureData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'numeroFacture', header: 'N° facture' },
          { key: 'montant', header: 'Montant' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateFacture', header: 'Date' },
        ];

        this.factureData = this.factureData.map((item: any) => ({
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

    if (this.activeFilters.numeroFacture) {
      filtreObj.numeroFacture = this.activeFilters.numeroFacture;
    }
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    if (this.activeFilters.annee) {
      filtreObj.annee = this.activeFilters.annee;
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