import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignementContextService, GestionClasseContext } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-list-absence-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-absence-component.html',
  styleUrl: './list-absence-component.css',
})
export class ListAbsenceComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;

  columns: any = [];

  deleteEndpoint = 'attendance';
  attendanceData: any = [];

  sessionSemestreList: any[] = [];

  public readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  tableSizes = [10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  classeId?: number;

  contexteClasse = signal<GestionClasseContext | null>(null);

  private readonly planification = inject(PlanificationResourceService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly commonService = inject(CommonService);
  private readonly enseignementContextService = inject(EnseignementContextService);

  constructor() {
    this.classeId = Number(this.activeRoute.snapshot.params['id']);
    console.log('ClassID', this.classeId);

    const contexte = this.enseignementContextService.getGestionClasseContext();

    console.log('contexteClasse', contexte?.classe);
    console.log('contexteMatiere', contexte?.matiere);

    console.log('contexteAnneeScolaire', contexte?.anneeScolaire);

    console.log('contexteCours', contexte?.courseId);


    if (contexte) {
      this.contexteClasse.set(contexte);
      console.log('Contexte chargé :', this.contexteClasse());
    }
  }

  ngOnInit(): void {
    void this.chargerLesAttendances();
  }

  async chargerLesAttendances() {
    try {
      this.chargerLesDonneesAttendances(false);

    } catch (error) {

      console.error('Erreur chargement données:', error);
    }
  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {
    return new Promise(
      (resolve, reject) => {

        this.planification.getResourceListe('referentiel/sessionsemestre')
          .subscribe({

            next: (data: any) => {
              this.sessionSemestreList = data;
              resolve(data);
            },

            error: (err: any) => reject(err)

          });
      }
    );
  }

  initialisationDesFiltres() {

    this.tableFilters = [

      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(
          s => ({
            value: s.id,
            label: `${s.semestre}`
          })
        )
      },

      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(
          m => ({
            value: m.id,
            label: m.mois
          })
        )
      }

    ];
  }

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters?.sessionSemestre) {
      filtreObj.sessionSemestre = this.activeFilters.sessionSemestre;
    }
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;
  }

  chargerLesDonneesAttendances(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {
      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.planification.fetchFilterDataTable(
        'evaluation/classe',
        this.currentPage,
        this.pageSize,
        filtreParam
      );

    } else {

      apiCall = this.planification.getResourceByIdPaged(
        'attendancerecord/cours',
        Number(this.courseId),
        this.currentPage,
        this.pageSize
      );
    }

    apiCall.subscribe({

      next: (response) => {
        this.attendanceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.attendanceData = this.attendanceData?.map(
          (item: any) => ({
            ...item
          })
        );

        this.columns = [
          {
            key: 'nomCompletEleve',
            header: 'Elève'
          },
          {
            key: 'attendanceDate',
            header: 'Date'
          },
          {
            key: 'sessionSemestre',
            header: 'Semestre'
          },
          {
            key: 'attendanceStatus',
            header: 'Status'
          },
          {
            key: 'lateMinutes',
            header: 'Laste minute'
          },
          {
            key: 'justified',
            header: 'Etat'
          },
          {
            key: 'course',
            header: 'Cours'
          }
        ];
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }

    });
  }

  canEditOrDeleteEvaluation(item: any): boolean {
    return item.etat !== 'Validée';
  }

  getMoisList(): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {

        this.commonService.getAllMois().subscribe({

          next: (data) => {
            this.moisList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
      }
    );
  }


  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(
      val =>
        val !== null &&
        val !== undefined &&
        val !== ''
    );

    this.currentPage = 0;
    this.chargerLesDonneesAttendances(this.hasActiveFilters);
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesAttendances(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonneesAttendances(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonneesAttendances(false);
  }

  get courseId(): number | undefined {
    return this.contexteClasse()?.courseId;
  }

  get heureDebutCours(): string | undefined {
    return this.contexteClasse()?.heureDebut;
  }


}

