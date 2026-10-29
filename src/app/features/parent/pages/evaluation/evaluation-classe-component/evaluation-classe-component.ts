import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ParentSessionService } from '../../../service/parent-session.service';

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
  sessionSemestreList: any[] = [];
  etatEvaluationOptions: any[] = [];
  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  nomClasseConcerne = '';

  isSelected = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly parentSession = inject(ParentSessionService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {

    const eleve = this.parentSession.getEleveResume();

    if (eleve) {
      this.classeId = eleve.classeId;
      this.nomClasseConcerne = `${eleve.classeEleve ?? ''}`.trim();
    }
  }

  ngOnInit(): void {
    this.chargerLesEvaluationsEleve();

  }

  private chargerLesEvaluationsEleve(): void {
    this.isLoading = true;

    forkJoin({
      semestres: this.referentielResourceService.getResourceList('sessionsemestre'),
      mois: this.commonService.getAllMois(),
      etat: this.commonService.getEtatEvaluations()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {

          this.sessionSemestreList = result.semestres || [];
          this.moisList = result.mois || [];

          this.etatEvaluationOptions = result.etat || [];

          this.initialisationDesFiltres();

          this.chargerLesDonnees(false);
        },

        error: (error) => {
          console.error('Erreur chargement des filtres:', error);
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
        options: this.sessionSemestreList.map(a => ({
          value: a.id,
          label: `${a.semestre}`
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
          { key: 'dateEvaluation', header: 'Date' },
          { key: 'horaire', header: 'Horaire' },
          { key: 'etat', header: 'État' },
        ];

        this.evaluationData = this.evaluationData.map((item: any) => ({
          ...item,
          horaire: this.formaterHoraire(item.heureDebut, item.heureFin)
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  formaterHoraire(heureDebut: string | null, heureFin: string | null): string {
    if (!heureDebut && !heureFin) {
      return '';
    }

    const debut = heureDebut ? heureDebut.substring(0, 5) : '';

    const fin = heureFin ? heureFin.substring(0, 5) : '';

    if (debut && fin) {
      return `${debut} - ${fin}`;
    }

    return debut || fin;
  }

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
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
}
