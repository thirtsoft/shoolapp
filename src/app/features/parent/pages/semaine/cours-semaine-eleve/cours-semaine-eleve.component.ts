import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-cours-semaine-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './cours-semaine-eleve.component.html',
  styleUrls: ['./cours-semaine-eleve.component.css']
})
export class CoursSemaineEleveComponent implements OnInit {
  coursId?: number | null;
  isLoading: boolean = false;
  filteredDataCours: any;
  isTable: boolean = true;
  deleteEndpoint = "cours";
  columns: any = [];
  coursData: any = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  matieresList: any[] = [];
  salleList: any[] = [];
  enseignantList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesCours();
    const role = localStorage.getItem('role');
  }

  async chargerLesCours() {
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
        label: 'Libellé cours',
        type: 'text',
        placeholder: 'Rechercher un cours...'
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

      apiCall = this.coursService.fetchFilterDataTable(
        'cours/classe',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourceByIdPaged('cours/classe', this.classeId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.coursData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'libelle', header: 'Libelle' },
          { key: 'matiere', header: 'Matière' },
          { key: 'salle', header: 'Salle' },
          { key: 'enseignant', header: 'Enseignant' },
          { key: 'dateDebut', header: 'Date' },
          { key: 'heureDebut', header: 'heure début' },
          { key: 'heureFin', header: 'heure fin' },

        ];
        this.coursData = this.coursData?.map((item: any) => ({
          ...item,
        }));
        console.log('Cours data response', this.coursData);
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
