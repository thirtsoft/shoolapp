import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { CommonService } from '../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../administration/referentiel/service/referentiel-resource.service';

@Component({
  selector: 'app-note-information',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './note-information.component.html',
  styleUrls: ['./note-information.component.css']
})
export class NoteInformationComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataMeeting: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  meetingData: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  etatfactureOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesMeetings();
  }

  async chargerLesMeetings() {
    try {
      await Promise.all([
        this.getMoisList(),
        this.getAnneesList()
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
        label: 'Libellé',
        type: 'text',
        placeholder: 'Rechercher une réunion...'
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

      apiCall = this.refentielResource.fetchFilterDataTable(
        'meeting/parent',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('meeting/parent', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.meetingData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'libelle', header: 'Libellé' },
          { key: 'dateMeeting', header: 'Date' },
          { key: 'heureDebut', header: 'Heure début' },
          { key: 'heureFin', header: 'Heure fin' },
          { key: 'typeMeeting', header: 'Nature reunion' },
        ]

        this.meetingData = this.meetingData.map((item: any) => ({
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

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
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

  // Dans votre composant (.ts)
  formatLocalDate(utcDate: string): string {
    return new Date(utcDate).toLocaleString('fr-FR'); // Adaptez la locale
  }
}