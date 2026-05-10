import { Component, inject, OnInit } from '@angular/core';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { CommonService } from '../../../../../../core/services/common.service';

@Component({
  selector: 'app-list-note-information',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-note-information.component.html',
  styleUrls: ['./list-note-information.component.css']
})
export class ListNoteInformationComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  coursId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataNoteInformation: any;
  isLockable: boolean = true;
  isPrinter: boolean = true;

  isTable: boolean = true;
  deleteEndpoint = "noteinformation";
  columns: any = [];
  noteInformationData: any = [];
  public readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  enseignantList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesNoteInformations();
  }

  async chargerLesNoteInformations() {
    try {
      await Promise.all([
        this.getMoistList(),
        this.getAnneetList()

      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMoistList(): Promise<any[]> {
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

  getAnneetList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllAnnees().subscribe({
        next: (data) => {
          this.anneesList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'reference',
        label: 'Référence',
        type: 'text',
        placeholder: 'Rechercher...'
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        })),
      },
      {
        key: 'annee',
        label: 'Années',
        type: 'select',
        options: this.anneesList.map(a => ({
          value: a.annee,
          label: a.annee
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
        'planification/noteinformation',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourcePaged('planification/noteinformation', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteInformationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'reference', header: 'Référence' },
          { key: 'dateCreation', header: 'Date' },
          { key: 'description', header: 'Description' }

        ];
        this.noteInformationData = this.noteInformationData?.map((item: any) => ({
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

    if (this.activeFilters.reference) {
      filtreObj.reference = this.activeFilters.reference;
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
