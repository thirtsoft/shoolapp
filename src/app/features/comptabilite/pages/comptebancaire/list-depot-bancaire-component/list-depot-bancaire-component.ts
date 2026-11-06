import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-list-depot-bancaire-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-depot-bancaire-component.html',
  styleUrl: './list-depot-bancaire-component.css',
})
export class ListDepotBancaireComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "depotbancaire";
  columns: any = [];
  depotBancaireData: any = [];

  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  etatDepotBnacaires: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;


  isSelected = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly commonService = inject(CommonService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() { }

  ngOnInit(): void {
    this.chargerLesDepotsBancaires();

  }

  private chargerLesDepotsBancaires(): void {
    this.isLoading = true;

    forkJoin({
      mois: this.commonService.getAllMois(),
      anneess: this.commonService.getAllAnnees(),
      etat: this.commonService.getAllStatusFactures()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {

          this.etatDepotBnacaires = result.etat || [];
          this.moisList = result.mois || [];
          this.anneesList = result.anneess || [];

          this.initialisationDesFiltres();

          this.chargerLesDonnees(false);
        },

        error: (error) => {
          console.error('Erreur chargement des filtres:', error);
          this.isLoading = false;
        }
      });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatDepotBnacaires.map(e => ({
          value: e.etat,
          label: e.etat
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
      {
        key: 'annees',
        label: 'Année',
        type: 'select',
        options: this.anneesList.map(m => ({
          value: m.id,
          label: m.annees
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

      apiCall = this.comptabiliteResource.fetchFilterDataTable(
        'depots-bancaires',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourcePaged('depots-bancaires', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.depotBancaireData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'codeDepot', header: 'Numéro' },
          { key: 'compteBancaireLibelle', header: 'N° compte bancaire' },
          { key: 'banqueLibelle', header: 'Banque' },
          { key: 'montant', header: 'Montant' },
          { key: 'etatLibelle', header: 'Etat' },
          { key: 'reference', header: 'Référence' },
          { key: 'dateDepot', header: 'Date' },
        ];

        this.depotBancaireData = this.depotBancaireData.map((item: any) => ({
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
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    if (this.activeFilters.annees) {
      filtreObj.annees = this.activeFilters.annees;
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
