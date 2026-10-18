import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../../core/services/common.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { Etat } from '../../../../administration/referentiel/pages/semestre/editer-session-semestre-component/editer-session-semestre-component';
import { EnseignementContextService, GestionClasseContext } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-list-evaluation-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-evaluation-enseignant.component.html',
  styleUrls: ['./list-evaluation-enseignant.component.css']
})
export class ListEvaluationEnseignantComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];

  deleteEndpoint = 'evaluation';
  evaluationData: any = [];

  sessionSemestreList: any[] = [];
  etatEvaluationOptions: any[] = [];

  etatCongesList: Etat[] = [
    {
      id: 8,
      code: 'E8',
      libelle: 'En cours',
    },
    {
      id: 2,
      code: 'E2',
      libelle: 'Remise',
    },
    {
      id: 3,
      code: 'E3',
      libelle: 'Envoyée',
    },
    {
      id: 4,
      code: 'E4',
      libelle: 'Validée',
    }
  ];


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


  private readonly route = inject(ActivatedRoute);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly commonService = inject(CommonService);
  private readonly enseignementContextService = inject(EnseignementContextService);
  private readonly dossierResource = inject(DossierResourceService);

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
    void this.chargerLesEvaluations();
  }

  async chargerLesEvaluations() {
    try {
      await Promise.all([
        this.getEtatEvaluationList(),
        this.getMoisList(),
        this.getSessionSemestreList()
      ]);

      this.initialisationDesFiltresEvaluation();
      this.chargerLesDonneesEvaluation(false);

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

  getEtatEvaluationList(): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {

        this.commonService.getEtatEvaluations().subscribe({

          next: (data: any) => {
            this.etatEvaluationOptions = data;
            resolve(data);
          },

          error: (err: any) =>
            reject(err)

        });
      }
    );
  }

  initialisationDesFiltresEvaluation() {

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
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatEvaluationOptions.map(
          e => ({
            value: e.etat,
            label: e.etat
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

  chargerLesDonneesEvaluation(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;
    if (useFilterApi) {
      const filtreParam = this.construireParametreDeFiltreEvaluation();
      apiCall = this.planification.fetchFilterDataTable(
        'evaluation/classe',
        this.currentPage,
        this.pageSize,
        filtreParam
      );

    } else {

      apiCall = this.planification.getResourceByIdPaged(
        'evaluation/classe',
        Number(this.classeId),
        this.currentPage,
        this.pageSize
      );
    }

    apiCall.subscribe({

      next: (response) => {

        this.evaluationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.evaluationData = this.evaluationData?.map(
          (item: any) => ({

            ...item,

            dureEvaluation: item.heureDebut + ' à  ' + item.heureFin

          })
        );

        this.columns = [

          {
            key: 'numeroEvaluation',
            header: 'N°'
          },

          {
            key: 'titre',
            header: 'Titre'
          },

          {
            key: 'evaluationMode',
            header: 'Mode'
          },

          {
            key: 'sessionSemestre',
            header: 'Semestre'
          },

          {
            key: 'evaluationType',
            header: 'Type'
          },

          {
            key: 'etat',
            header: 'Etat'
          },

          {
            key: 'dateEvaluation',
            header: 'Date'
          },

          {
            key: 'dureEvaluation',
            header: 'Heure'
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

  construireParametreDeFiltreEvaluation(): any {
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

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesEvaluation(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string) {

    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;

      this.chargerLesDonneesEvaluation(this.hasActiveFilters);
    }
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
    this.chargerLesDonneesEvaluation(this.hasActiveFilters);
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltresEvaluation();
    this.currentPage = 0;
    this.chargerLesDonneesEvaluation(false);
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


}
