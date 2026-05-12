import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-note-semaine-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './note-semaine-eleve.component.html',
  styleUrls: ['./note-semaine-eleve.component.css']
})
export class NoteSemaineEleveComponent implements OnInit {

  isLoading: boolean = false;
  filteredDataNote: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  noteData: any = [];
  matieresList: any[] = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];


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
    this.chargerLesNotesDeEleve();
  }

  async chargerLesNotesDeEleve() {
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
        key: 'matiere',
        label: 'Matière',
        type: 'select',
        options: this.matieresList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
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
        'note/semaine/eleve',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourceByIdPaged('note/semaine/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matière' },
          { key: 'semestre', header: 'Semestre' },
          { key: 'note', header: 'Note' },
          { key: 'type', header: 'Type' },

        ];
        this.noteData = this.noteData?.map((item: any) => ({
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
    if (this.activeFilters.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
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
