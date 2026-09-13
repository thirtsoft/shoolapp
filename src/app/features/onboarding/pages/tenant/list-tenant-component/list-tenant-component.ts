import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { OnboardingApiService } from '../../../service/onboarding-api.service';

@Component({
  selector: 'app-list-tenant-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-tenant-component.html',
  styleUrl: './list-tenant-component.css',
})
export class ListTenantComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataTenant: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "tenants";
  columns: any = [];
  tenantData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly router = inject(Router);
  private readonly api = inject(OnboardingApiService);


  ngOnInit(): void {
    this.chargerLaListeDesTenants();

  }

  async chargerLaListeDesTenants() {
    try {
      await Promise.all([
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libellé',
        type: 'text',
        placeholder: 'Rechercher un tenant...'
      }
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
      const filtreParam = this.construireLesParametreDeFiltre();
      apiCall = this.api.fetchFilterByElementDataTable(
        'tenants',
        this.currentPage,
        this.pageSize,
        filtreParam)
    } else {
      apiCall = this.api.getTenantResourcePaged('tenants', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data response', response);
        this.tenantData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        console.log('Eleves', this.tenantData)

        this.columns = [
          { key: 'code', header: 'Code' },
          { key: 'libelle', header: 'Libellé' },
          { key: 'mobile', header: 'Mobile' },
          { key: 'adresse', header: 'Adresse' },
          { key: 'currencyUuid', header: 'Devise' },
          { key: 'countryUuid', header: 'Pays' },

        ];
        this.tenantData = this.tenantData?.map((item: any) => ({
          ...item,
        }));
        console.log('Data {}', this.tenantData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireLesParametreDeFiltre(): any {
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
