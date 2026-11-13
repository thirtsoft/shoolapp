import { Component, inject, OnInit } from '@angular/core';

import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

import { RechercheNote } from '../../../../../../core/models/dossiereleve/note/rechercher-note';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';

import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-list-notes',
  standalone: true,
  imports: [
    GenericTableDossierComponent
  ],
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.css']
})
export class ListNotesComponent implements OnInit {

  errorMessage?: string;

  today = new Date();
  noteId?: number | null;

  isEdit = true;
  isLoading = false;
  isLockable = true;
  isTable = true;

  deleteEndpoint = 'note';

  columns: any[] = [];
  noteData: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  classesList: ListeClasse[] = [];
  matieresList: any[] = [];
  sessionSemestreList: Semestre[] = [];

  typesNoteOptions: string[] = ['DEVOIR', 'COMPOSITION'];

  moisList: any[] = [];
  anneeList: any[] = [];


  tableFilters: IFilterConfig[] = [];

  activeFilters: Partial<RechercheNote> = {};

  hasActiveFilters = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesNotes();
  }

  async chargerLesNotes(): Promise<void> {

    try {

      await Promise.all([
        this.getClassList(),
        this.getMatiereList(),
        this.getSessionSemestreList(),
        this.getMoisList(),
        this.getAnneesList()
      ]);

      this.initialisationDesFiltres();

      this.chargerLesDonnees(false);

    } catch (error) {

      console.error(
        'Erreur chargement données notes :',
        error
      );

    }
  }


  getClassList(): Promise<ListeClasse[]> {

    return new Promise((resolve, reject) => {

      this.referentielService
        .getResourceList('classe')
        .subscribe({

          next: (data: any[]) => {

            this.classesList = data ?? [];

            resolve(this.classesList);

          },

          error: (err: any) => {

            console.error(
              'Erreur chargement classes :',
              err
            );

            reject(err);

          }

        });

    });

  }

  getMatiereList(): Promise<any[]> {

    return new Promise((resolve, reject) => {

      this.referentielService
        .getResourceList('matiere')
        .subscribe({

          next: (data: any[]) => {

            this.matieresList = data ?? [];

            resolve(this.matieresList);

          },

          error: (err: any) => {

            console.error(
              'Erreur chargement matières :',
              err
            );

            reject(err);

          }

        });

    });

  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {

    return new Promise((resolve, reject) => {

      this.referentielService
        .getResourceList('sessionsemestre')
        .subscribe({

          next: (data: any[]) => {

            this.sessionSemestreList = data ?? [];

            resolve(this.sessionSemestreList);

          },

          error: (err: any) => {

            console.error(
              'Erreur chargement sessions / semestres :',
              err
            );

            reject(err);

          }

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

            console.error(
              'Erreur chargement mois :',
              err
            );

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

            console.error(
              'Erreur chargement années :',
              err
            );

            reject(err);

          }

        });

    });

  }

  initialisationDesFiltres(): void {

    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom / Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },

      {
        key: 'classe',
        label: 'Classe',
        type: 'select',

        options: this.classesList.map(classe => ({
          value: classe.id,
          label: classe.libelle
        })),

        placeholder: 'Sélectionnez une classe'
      },

      {
        key: 'matiere',
        label: 'Matière',
        type: 'select',

        options: this.matieresList.map(matiere => ({
          value: matiere.id,
          label:
            matiere.libelle ??
            matiere.nom ??
            `Matière ${matiere.id}`
        })),

        placeholder: 'Sélectionnez une matière'
      },

      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',

        options: this.sessionSemestreList.map(session => ({
          value: session.id,
          label: session.libelle
        })),

        placeholder: 'Sélectionnez un semestre'
      },

      {
        key: 'type',
        label: 'Type de note',
        type: 'select',

        options: this.typesNoteOptions.map(type => ({
          value: type,
          label: type
        })),

        placeholder: 'Sélectionnez un type'
      },


      {
        key: 'mois',
        label: 'Mois',
        type: 'select',

        options: this.moisList.map(mois => ({
          value: mois.id,
          label: mois.mois
        })),

        placeholder: 'Sélectionnez un mois'
      },

      {
        key: 'annee',
        label: 'Année',
        type: 'select',

        options: this.anneeList.map(annee => ({
          value: annee.annee,
          label: annee.annee
        })),

        placeholder: 'Sélectionnez une année'
      }

    ];
  }

  onFilterChange(filter: IFilterConfig, value: any): void {

    const key =
      filter.key as keyof RechercheNote;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      delete this.activeFilters[key];

    } else {

      this.activeFilters[key] = value;

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
        'note',
        this.currentPage,
        this.pageSize,
        this.construireParametreDeFiltre()
      )

      : this.dossierResource.getResourcePaged(
        'note',
        this.currentPage,
        this.pageSize
      );

    apiCall.subscribe({

      next: (response: any) => {

        this.noteData =
          response.data?.content ?? [];

        this.totalElements =
          response.data?.totalElements ?? 0;

        this.columns = [

          {
            key: 'eleve',
            header: 'Élève'
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
            key: 'note',
            header: 'Note'
          },

          {
            key: 'type',
            header: 'Type de note'
          }

        ];

        this.isLoading = false;

      },

      error: (error: any) => {

        console.error(
          'Erreur chargement notes :',
          error
        );

        this.noteData = [];
        this.totalElements = 0;

        this.isLoading = false;

      }

    });

  }

  construireParametreDeFiltre(): RechercheNote {

    const filtre: RechercheNote = {};

    if (this.activeFilters.nomPrenom) {

      filtre.nomPrenom =
        this.activeFilters.nomPrenom;

    }

    if (this.activeFilters.classe) {

      filtre.classe =
        this.activeFilters.classe;

    }

    if (this.activeFilters.matiere) {

      filtre.matiere =
        this.activeFilters.matiere;

    }

    if (this.activeFilters.sessionSemestre) {

      filtre.sessionSemestre =
        this.activeFilters.sessionSemestre;

    }

    if (this.activeFilters.type) {

      filtre.type =
        this.activeFilters.type;

    }

    if (this.activeFilters.mois) {

      filtre.mois =
        this.activeFilters.mois;

    }

    if (this.activeFilters.annee) {

      filtre.annee =
        this.activeFilters.annee;

    }

    return filtre;
  }

  get totalPages(): number {

    return Math.ceil(
      this.totalElements / this.pageSize
    );

  }

  changePage(pageNumber: number): void {

    if (
      pageNumber >= 0 &&
      pageNumber < this.totalPages
    ) {

      this.currentPage = pageNumber;

      this.chargerLesDonnees(
        this.hasActiveFilters
      );

    }

  }

  changeSize(size: number | string): void {

    const newSize =
      typeof size === 'string'
        ? parseInt(size, 10)
        : size;

    if (this.pageSize !== newSize) {

      this.pageSize = newSize;

      this.currentPage = 0;

      this.chargerLesDonnees(
        this.hasActiveFilters
      );

    }

  }

  resetFilters(): void {

    this.activeFilters = {};

    this.hasActiveFilters = false;

    this.currentPage = 0;

    this.initialisationDesFiltres();

    this.chargerLesDonnees(false);

  }

}