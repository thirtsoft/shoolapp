import { Component, inject, OnInit } from '@angular/core';
import { PlanificationResourceService } from '../../services/planification-resource.service';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { CommonService } from '../../../../../core/services/common.service';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';

@Component({
  selector: 'app-evenement',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './evenement.component.html',
  styleUrls: ['./evenement.component.css']
})
export class EvenementComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEvenement: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "evenement";
  columns: any = [];
  evenementData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  statusEvenementOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesEvenements();
  }

  async chargerLesEvenements() {
    try {
      await Promise.all([
        this.getStatusEvenementList(),
        this.getMoisList(),
        this.getAnneesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }
  getStatusEvenementList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllStatusEvenements().subscribe({
        next: (data) => {
          this.statusEvenementOptions = data;
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

  getAnneesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllAnnees().subscribe({
        next: (data) => {
          this.anneeList = data;
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
        key: 'etat',
        label: 'Status',
        type: 'select',
        options: this.statusEvenementOptions.map(e => ({
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
      {
        key: 'annee',
        label: 'Année',
        type: 'select',
        options: this.anneeList.map(a => ({
          value: a.annee,
          label: a.annee
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

      apiCall = this.planificationResource.fetchFilterDataTable(
        'planification/evenement',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('planification/evenement', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evenementData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'libelle', header: 'Libellé' },
          { key: 'dateEvenement', header: 'Date' },
          { key: 'etat', header: 'Etat' },
          { key: 'description', header: 'Description' },
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
