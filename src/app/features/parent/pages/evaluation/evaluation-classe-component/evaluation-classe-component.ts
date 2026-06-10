import { Component, inject, OnInit } from '@angular/core';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';

@Component({
  selector: 'app-evaluation-classe-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './evaluation-classe-component.html',
  styleUrl: './evaluation-classe-component.css',
})
export class EvaluationClasseComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEvaluation: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "evaluation";
  columns: any = [];
  evaluationData: any = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  matieresList: any[] = [];
  classesList: any[] = [];
  semestreList: any[] = [];
  sessionSemestreList: any[] = [];
  enseignementList: any[] = [];

  etatEvaluationOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesEvaluationsEleve();

  }

  async chargerLesEvaluationsEleve() {
    try {
      await Promise.all([
        this.getEtatEvaluationList(),
        this.getMoisList(),
        this.getAnneesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielResourceService.getResourceList('sessionsemestre').subscribe({
        next: (data: any) => {
          this.sessionSemestreList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getEtatEvaluationList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getEtatEvaluations().subscribe({
        next: (data: any) => {
          this.etatEvaluationOptions = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
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
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(a => ({
          value: a.id,
          label: `${a.libelle}`
        }))
      },

      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatEvaluationOptions.map(e => ({
          value: e.etat,
          label: e.etat
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

      apiCall = this.dossierResource.fetchFilterByElementDataTable(
        'evaluation/classe',
        this.classeId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.dossierResource.getResourcesByIdPaged('evaluation/classe', this.classeId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evaluationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'matiere', header: 'Matière' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'evaluationType', header: 'Type' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateEvaluation', header: 'Date' },
        ];

        this.evaluationData = this.evaluationData.map((item: any) => ({
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

    if (this.activeFilters.numeroFacture) {
      filtreObj.numeroFacture = this.activeFilters.numeroFacture;
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
