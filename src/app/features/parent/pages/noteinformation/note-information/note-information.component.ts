import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { CommonService } from '../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-note-information',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './note-information.component.html',
  styleUrls: ['./note-information.component.css']
})
export class NoteInformationComponent implements OnInit {

  errorMessage?: string;
  isLoading: boolean = false;
  noteInformationData: any;
  isTable: boolean = true;
  columns: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesNoteInformations();
  }

  async chargerLesNoteInformations() {
    try {
      await Promise.all([
        this.getMoisList()
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
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        }))
      }
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
        'planification/noteinformation',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('planification/noteinformation', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteInformationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'reference', header: 'Référence' },
          { key: 'dateCreation', header: 'Date' },

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
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  // Dans votre composant (.ts)
  formatLocalDate(utcDate: string): string {
    return new Date(utcDate).toLocaleString('fr-FR'); // Adaptez la locale
  }
}