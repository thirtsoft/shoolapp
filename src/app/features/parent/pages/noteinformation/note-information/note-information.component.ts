import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-note-information',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './note-information.component.html',
  styleUrls: ['./note-information.component.css']
})
export class NoteInformationComponent implements OnInit {

  errorMessage?: string;
  isLoading: boolean = false;
  isPrinter: boolean = true;
  noteInformationData: any;
  isTable: boolean = true;
  columns: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);


  ngOnInit(): void {
    this.chargerLesNoteInformations();
  }

  private chargerLesNoteInformations() {
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

      const filtreParam = this.construireLesParamereDeFiltre();

      apiCall = this.planificationResource.fetchFilterDataTable(
        'planification/noteinformation-publie',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('planification/noteinformation-publie', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteInformationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'reference', header: 'Référence' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateCreation', header: 'Date' },
          { key: 'description', header: 'Description' }
        ]

        this.noteInformationData = this.noteInformationData.map((item: any) => ({
          ...item,

        }),);


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
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  formatLocalDate(utcDate: string): string {
    return new Date(utcDate).toLocaleString('fr-FR');
  }
}