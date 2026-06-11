import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';


@Component({
  selector: 'app-list-absence-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-absence-eleve.component.html',
  styleUrls: ['./list-absence-eleve.component.css']
})
export class ListAbsenceEleveComponent implements OnInit {

  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  absenceData: any = [];
  isEdit: boolean = true;

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  sessionSemestreList: any[] = [];
  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly dossierEleveService = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
  }

  ngOnInit(): void {
    this.chargerLesAbsencesEleve();
  }

  async chargerLesAbsencesEleve() {
    try {
      await Promise.all([
        this.chargerLesDonneesFiltre()

      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  private chargerLesDonneesFiltre() {
    this.referentielResourceService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });

    this.commonService.getAllMois().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.moisList = data
    });

  }

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let resultatAPI;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametreDeFiltre();

      resultatAPI = this.dossierEleveService.fetchFilterByElementDataTable(
        'attendancerecord/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      resultatAPI = this.dossierEleveService.getResourcesByIdPaged('attendancerecord/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    resultatAPI.subscribe({
      next: (response) => {
        this.absenceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'anneeScolare', header: 'Année scolaire' },
          { key: 'libelleJustifiee', header: 'Etat absence' },
          { key: 'attendanceStatus', header: 'Type absence' },
          { key: 'dateAbsence', header: 'Date absence' },
          { key: 'date_declaration', header: 'Date déclaration' },
        ];

        this.absenceData = this.absenceData.map((item: any) => ({
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

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
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

  construireLesParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }


}
