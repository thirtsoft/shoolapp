import { Component, inject, OnInit } from '@angular/core';
import { GenericTableReferentielComponent } from '../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { CommonService } from '../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../administration/referentiel/service/referentiel-resource.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-liste-evenement',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './liste-evenement.component.html',
  styleUrls: ['./liste-evenement.component.css']
})
export class ListeEvenementComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEvenement: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  evenementData: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  statusEvenementOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);
  private readonly refentielResourceService = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesEvenements();
  }

  async chargerLesEvenements() {
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
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un évenement...'
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

      apiCall = this.refentielResourceService.fetchFilterDataTable(
        'planification/evenementpublie',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResourceService.getResourcePaged('planification/evenementpublie', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evenementData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'libelle', header: 'Libellé' },
          { key: 'type', header: 'Type événement' },
          { key: 'typeActivite', header: 'Type activité' },
          { key: 'date', header: 'Date' },
          { key: 'heure', header: 'Heure' },
        ]

        this.evenementData = this.evenementData.map((item: any) => ({
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

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
    }
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
