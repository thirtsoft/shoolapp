import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-list-session-semestre-component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-session-semestre-component.html',
  styleUrl: './list-session-semestre-component.css',
})
export class ListSessionSemestreComponent implements OnInit {
  errorMessage?: string;
  sessionSemestre: SessionSemestre[] = [];
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataSessionSemestre: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "sessionSemestre";
  columns: any[] = [];
  sessionSemestreData: any = [];
  anneeScolaireList: any[] = [];
  semestreList: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesSessionSemestres();
  }

  async chargerLesSessionSemestres() {
    try {
      await Promise.all([
        this.getSemestreList(),
        this.getAnneeScolaireList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getAnneeScolaireList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('anneescolaire').subscribe({
        next: (data: any) => {
          this.anneeScolaireList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('semestre').subscribe({
        next: (data: any) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: this.semestreList.map(s => ({
          value: s.id,
          label: s.libelle
        }))
      },
      {
        key: 'anneeScolaireId',
        label: 'Année scolaire',
        type: 'select',
        options: this.anneeScolaireList.map(a => ({
          value: a.id,
          label: a.libelle
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.refentielResource.fetchFilterDataTable(
        'sessionsemestre',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('sessionsemestre', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.sessionSemestreData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'semestre', header: 'Semestre' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateDebut', header: 'Date début' },
          { key: 'dateFin', header: 'Date fin' },

        ];
        this.sessionSemestreData = this.sessionSemestreData.map((item: any) => ({
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
    if (this.activeFilters.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }
    if (this.activeFilters.anneeScolaireId) {
      filtreObj.anneeScolaireId = this.activeFilters.anneeScolaireId;
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

