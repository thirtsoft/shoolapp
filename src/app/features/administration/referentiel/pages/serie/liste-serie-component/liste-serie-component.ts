import { Component, inject, OnInit } from '@angular/core';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-liste-serie-component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './liste-serie-component.html',
  styleUrl: './liste-serie-component.css',
})
export class ListeSerieComponent implements OnInit {
  errorMessage?: string;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "serie";
  columns: any = [];
  serieData: any = [];
  isEdit: boolean = true;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesSeries()
  }

  async chargerLesSeries() {
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
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher une serie'
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.refentielResource.fetchFilterDataTable(
        'serie',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('serie', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.serieData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'code', header: 'Code' },
          { key: 'libelle', header: 'Libellé' },
        ];
        this.serieData = this.serieData.map((item: any) => ({
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
