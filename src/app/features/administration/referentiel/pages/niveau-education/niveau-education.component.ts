import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { NiveauEducation } from '../../../../../core/models/referentiels/niveau-eduction';
import { ReferentielResourceService } from '../../service/referentiel-resource.service';

@Component({
  selector: 'app-niveau-education',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './niveau-education.component.html',
  styleUrls: ['./niveau-education.component.css']
})
export class NiveauEducationComponent implements OnInit {
  errorMessage?: string;
  niveauEducation: NiveauEducation[] = [];
  niveauEducationId?: number;

  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataNiveauEducation: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "niveaueducation";
  columns: any = [];
  niveauEducationData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);


  ngOnInit(): void {
    this.chargerLesNiveauEducations()
  }

  async chargerLesNiveauEducations() {
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
        placeholder: 'Rechercher un niveau'
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
        'niveaueducation',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('niveaueducation', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.niveauEducationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'code', header: 'Code' },
          { key: 'libelle', header: 'Libellé' },
        ];
        this.niveauEducationData = this.niveauEducationData.map((item: any) => ({
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