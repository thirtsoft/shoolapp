import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { OnboardingApiService } from '../../../service/onboarding-api.service';

@Component({
  selector: 'app-list-onboarding-precess-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-onboarding-precess-component.html',
  styleUrl: './list-onboarding-precess-component.css',
})
export class ListOnboardingPrecessComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "process";
  columns: any = [];
  processData: any = [];

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
    this.chargerLaListeDesOnboardingProcess();

  }

  async chargerLaListeDesOnboardingProcess() {
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
      apiCall = this.api.fetchFilterOnboardingProcessDataTable(
        'onboarding',
        this.currentPage,
        this.pageSize,
        filtreParam)
    } else {
      apiCall = this.api.getOnboardingProcessTenantResourcePaged('onboarding', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data response', response);
        this.processData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        console.log('Eleves', this.processData)

        this.columns = [
          { key: 'workflowCode', header: 'Numéro' },
          { key: 'tenantName', header: 'Client' },
          { key: 'subscriptionNumero', header: 'Abonnement' },
          { key: 'invoiceNumero', header: 'Facture' },
          { key: 'currentStep', header: 'Etape' },
          { key: 'status', header: 'Status' },
          { key: 'startedAt', header: 'Date début' },
          { key: 'completedAt', header: 'Date fin' },
          { key: 'errorMessage', header: 'Error message' },

        ];
        this.processData = this.processData?.map((item: any) => ({
          ...item,
        }));
        console.log('Data {}', this.processData);
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
