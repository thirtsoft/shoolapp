import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { RechercheEvaluation } from '../../../../../../core/models/dossiereleve/evaluation/rechercher-evaluation';

import { CommonService } from '../../../../../../core/services/common.service';

import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';

import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';

import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-list-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-evaluation.component.html',
  styleUrls: ['./list-evaluation.component.css']
})
export class ListEvaluationComponent implements OnInit {

  errorMessage?: string;

  today = new Date();

  isEdit = true;
  isLoading = false;
  isLockable = true;
  isTable = true;
  isSelected = false;

  deleteEndpoint = 'evaluation';

  columns: any[] = [];
  evaluationData: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  tableSizes = [10, 20, 50, 100];

  matieresList: any[] = [];
  classesList: ListeClasse[] = [];

  sessionSemestreList: SessionSemestre[] = [];

  enseignementList: any[] = [];
  filteredEnseignementList: any[] = [];

  etatEvaluationOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  evaluationTypeOptions: any[] = [
    {
      value: 'DEVOIR',
      label: 'Devoir'
    },
    {
      value: 'COMPOSITION',
      label: 'Composition'
    }
  ];

  tableFilters: IFilterConfig[] = [];

  activeFilters: Partial<RechercheEvaluation> = {};

  hasActiveFilters = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesEvaluations();
  }


  async chargerLesEvaluations(): Promise<void> {

    try {

      await Promise.all([
        this.getClassList(),
        this.getMatiereList(),
        this.getEtatEvaluationList(),
        this.getMoisList(),
        this.getAnneesList(),
        this.getSessionSemestreList()
      ]);

      this.initialisationDesFiltres();

      this.chargerLesDonnees(false);

    } catch (error) {

      console.error(
        'Erreur chargement données évaluations :',
        error
      );

    }
  }

  getClassList(): Promise<ListeClasse[]> {

    return new Promise((resolve, reject) => {

      this.referentielService.getAllClasses().subscribe({

        next: (data: ListeClasse[]) => {

          this.classesList = data ?? [];

          resolve(this.classesList);
        },

        error: (err: any) => {
          reject(err);
        }

      });

    });
  }

  getMatiereList(): Promise<any[]> {

    return new Promise((resolve, reject) => {

      this.referentielResourceService
        .getResourceList('matiere')
        .subscribe({

          next: (data: any[]) => {

            this.matieresList = data ?? [];

            resolve(this.matieresList);
          },

          error: (err: any) => {
            reject(err);
          }

        });

    });
  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {

    return new Promise((resolve, reject) => {

      this.referentielResourceService
        .getResourceList('sessionsemestre')
        .subscribe({

          next: (data: any[]) => {

            this.sessionSemestreList = data ?? [];

            resolve(this.sessionSemestreList);
          },

          error: (err: any) => {
            reject(err);
          }

        });

    });
  }

  chargerEnseignementsParClasse(classeId: number): Promise<any[]> {

    return new Promise((resolve, reject) => {

      if (!classeId) {

        this.filteredEnseignementList = [];

        this.mettreAJourFiltreEnseignement();

        resolve([]);

        return;
      }

      this.dossierResource
        .getResourceList(
          `planification/enseignement/by-classe/${classeId}`
        )
        .subscribe({

          next: (data: any[]) => {

            this.filteredEnseignementList = data ?? [];

            this.mettreAJourFiltreEnseignement();

            resolve(this.filteredEnseignementList);
          },

          error: (err: any) => {

            console.error(
              'Erreur chargement enseignements :',
              err
            );

            this.filteredEnseignementList = [];

            this.mettreAJourFiltreEnseignement();

            reject(err);
          }

        });

    });
  }


  mettreAJourFiltreEnseignement(): void {

    const index = this.tableFilters.findIndex(
      filter => filter.key === 'enseignement'
    );

    if (index === -1) {
      return;
    }

    const options = this.filteredEnseignementList.map(
      (enseignement: any) => ({
        value: enseignement.id,
        label:
          enseignement.libelle ??
          enseignement.matiere ??
          enseignement.description ??
          `Enseignement ${enseignement.id}`
      })
    );

    const updatedFilter: IFilterConfig = {
      ...this.tableFilters[index],
      options,
      disabled: options.length === 0,
      placeholder:
        options.length === 0
          ? 'Aucun enseignement disponible'
          : 'Sélectionnez un enseignement'
    };

    const enseignementActif =
      this.activeFilters.enseignement;

    if (
      enseignementActif &&
      !this.filteredEnseignementList.some(
        e => e.id === enseignementActif
      )
    ) {
      delete this.activeFilters.enseignement;
    }

    this.tableFilters = [
      ...this.tableFilters.slice(0, index),
      updatedFilter,
      ...this.tableFilters.slice(index + 1)
    ];
  }


  getEtatEvaluationList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService
        .getEtatEvaluations()
        .subscribe({
          next: (data: any[]) => {
            this.etatEvaluationOptions = data ?? [];
            resolve(this.etatEvaluationOptions);
          },
          error: (err: any) => { reject(err); }
        });

    });
  }

  getMoisList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService
        .getAllMois()
        .subscribe({
          next: (data: any[]) => {
            this.moisList = data ?? [];
            resolve(this.moisList);
          },
          error: (err: any) => {
            reject(err);
          }

        });

    });
  }

  getAnneesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService
        .getAllAnnees()
        .subscribe({
          next: (data: any[]) => {
            this.anneeList = data ?? [];
            resolve(this.anneeList);
          },
          error: (err: any) => {
            reject(err);
          }

        });

    });
  }

  initialisationDesFiltres(): void {
    this.tableFilters = [
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classesList.map(
          classe => ({
            value: classe.id,
            label: classe.libelle
          })
        )
      },
      {
        key: 'matiere',
        label: 'Matière',
        type: 'select',
        options: this.matieresList.map(
          matiere => ({
            value: matiere.id,
            label:
              matiere.libelle ??
              matiere.nom ??
              `Matière ${matiere.id}`
          })
        )
      },
      /* {
        key: 'enseignement',
        label: 'Enseignement',
        type: 'select',
        options: [],
        disabled: true,
        placeholder: 'Sélectionnez une classe'
      }, */
      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(
          session => ({
            value: session.id,
            label: session.semestre
          })
        )
      },
      {
        key: 'etat',
        label: 'État',
        type: 'select',
        options: this.etatEvaluationOptions.map(
          etat => ({
            value: etat.id ?? etat.etat,
            label: etat.libelle ?? etat.etat
          })
        )
      },

      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: this.evaluationTypeOptions
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(
          mois => ({
            value: mois.id,
            label: mois.mois
          })
        )
      },
      {
        key: 'annee',
        label: 'Année',
        type: 'select',
        options: this.anneeList.map(
          annee => ({
            value: annee.annee,
            label: annee.annee
          })
        )
      }

    ];
  }

  async onFilterChange(filter: IFilterConfig, value: any): Promise<void> {
    const ancienneClasse = this.activeFilters.classe;
    if (filter.key === 'classe' && value !== ancienneClasse) {
      delete this.activeFilters.enseignement;
      this.activeFilters.classe = value;
      await this.chargerEnseignementsParClasse(value);

    } else {

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {

        delete this.activeFilters[
          filter.key as keyof RechercheEvaluation
        ];

      } else {

        this.activeFilters[
          filter.key as keyof RechercheEvaluation
        ] = value;
      }
    }

    this.hasActiveFilters =
      Object.values(this.activeFilters).some(
        value =>
          value !== null &&
          value !== undefined &&
          value !== ''
      );

    this.currentPage = 0;

    this.chargerLesDonnees(
      this.hasActiveFilters
    );
  }

  chargerLesDonnees(useFilterApi: boolean): void {

    this.isLoading = true;

    const apiCall = useFilterApi

      ? this.dossierResource.filteredFilterDataTable(
        'evaluation',
        this.currentPage,
        this.pageSize,
        this.construireParametreDeFiltre()
      )

      : this.dossierResource.getResourcePaged(
        'evaluation',
        this.currentPage,
        this.pageSize
      );


    apiCall.subscribe({

      next: (response: any) => {

        this.evaluationData = response.data?.content ?? [];
        this.totalElements = response.data?.totalElements ?? 0;

        this.columns = [

          {
            key: 'titre',
            header: 'Titre'
          },

          {
            key: 'classe',
            header: 'Classe'
          },

          {
            key: 'matiere',
            header: 'Matière'
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
            key: 'dateEvaluation',
            header: 'Date'
          }

        ];

        this.isLoading = false;
      },

      error: (error: any) => {

        console.error(
          'Erreur chargement évaluations :',
          error
        );

        this.evaluationData = [];
        this.totalElements = 0;

        this.isLoading = false;
      }

    });
  }

  construireParametreDeFiltre(): RechercheEvaluation {

    const filtre: RechercheEvaluation = {};

    if (this.activeFilters.classe) {
      filtre.classe = this.activeFilters.classe;
    }

 /*    if (this.activeFilters.enseignement) {
      filtre.enseignement = this.activeFilters.enseignement;
    } */

    if (this.activeFilters.matiere) {
      filtre.matiere = this.activeFilters.matiere;
    }

    if (this.activeFilters.sessionSemestre) {
      filtre.sessionSemestre = this.activeFilters.sessionSemestre;
    }

    if (this.activeFilters.etat) {
      filtre.etat = this.activeFilters.etat;
    }

    if (this.activeFilters.type) {
      filtre.type = this.activeFilters.type;
    }

    if (this.activeFilters.mois) {
      filtre.mois = this.activeFilters.mois;
    }

    if (this.activeFilters.annee) {
      filtre.annee = this.activeFilters.annee;
    }

    return filtre;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number): void {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }


  changeSize(size: number | string): void {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {

      this.pageSize = newSize;

      this.currentPage = 0;

      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  resetFilters(): void {

    this.activeFilters = {};

    this.hasActiveFilters = false;

    this.filteredEnseignementList = [];

    this.initialisationDesFiltres();

    this.currentPage = 0;

    this.chargerLesDonnees(false);
  }

  canEditOrDeleteEvaluation(item: any): boolean {

    return item.etat !== 'Validée';
  }

}