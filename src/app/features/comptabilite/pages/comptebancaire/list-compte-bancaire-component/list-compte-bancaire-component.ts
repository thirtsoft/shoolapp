import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';


@Component({
  selector: 'app-list-compte-bancaire-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-compte-bancaire-component.html',
  styleUrl: './list-compte-bancaire-component.css',
})
export class ListCompteBancaireComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "comptebancaire";
  columns: any = [];
  compteBancaireData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  typeDepenseList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);

  ngOnInit(): void {
    this.chargerLesCompteBancaires();
  }

  chargerLesCompteBancaires() {
    this.chargerLesDonnees(false);
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.comptabiliteResource.fetchFilterDataTable(
        'comptes-bancaires',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourcePaged('comptes-bancaires', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.compteBancaireData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'numeroCompte', header: 'N° compte' },
          { key: 'libelle', header: 'Libellé' },
          { key: 'banqueLibelle', header: 'Banque' },
          { key: 'soldeInitial', header: 'Solde compte' },
          { key: 'dateSoldeInitial', header: 'Date' },
        ];
        this.compteBancaireData = this.compteBancaireData.map((item: any) => ({
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

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.numeroDepense) {
      filtreObj.numeroDepense = this.activeFilters.numeroDepense;
    }
    if (this.activeFilters.typeDepense) {
      filtreObj.typeDepense = this.activeFilters.typeDepense;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }

    if (this.activeFilters?.annee) {
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
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }


}
