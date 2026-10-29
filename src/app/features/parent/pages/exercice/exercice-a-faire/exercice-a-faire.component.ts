import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { EnseigantList } from '../../../../../core/models/enseignant/enseignant-list';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignantService } from '../../../../enseignant/service/enseignant.service';
import { ParentSessionService } from '../../../service/parent-session.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-exercice-a-faire',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './exercice-a-faire.component.html',
  styleUrls: ['./exercice-a-faire.component.css']
})
export class ExerciceAFaireComponent implements OnInit {

  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  exerciceData: any = [];

  private readonly destroy$ = new Subject<void>();

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  livreList: any;
  classesList: any[] = [];
  enseignantList: any[] = [];
  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  nomClasseConcerne = '';

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly parentSession = inject(ParentSessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly enseigantService = inject(EnseignantService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly sessionService = inject(ParentSessionService);

  constructor(
  ) {

    const eleve = this.parentSession.getEleveResume();

    if (eleve) {
      this.classeId = eleve.classeId;
      this.nomClasseConcerne = `${eleve.classeEleve ?? ''}`.trim();
    }
  }

  ngOnInit(): void {
    this.chargerLesExercices();

  }

  private chargerLesExercices(): void {
    this.isLoading = true;
    forkJoin({
      livre: this.planificationResource.getResourceList('livre'),
      mois: this.commonService.getAllMois(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {
          this.moisList = result.mois || [];
          this.livreList = result.livre || [];

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
        key: 'titre',
        label: 'Titre exercice',
        type: 'text',
        placeholder: 'Rechercher un exercie...'
      },
      {
        key: 'livre',
        label: 'Livre',
        type: 'select',
        options: this.livreList.map((c: any) => ({
          value: c.id,
          label: c.titre
        })),
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: `${m.mois}`
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

      const filtreParam = this.construireParametreFiltre();

      apiCall = this.planificationResource.fetchFilterByElementDataTable(
        'planification/exercice/classe',
        this.classeId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourceByIdPaged('planification/exercice/classe', this.classeId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.exerciceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'livre', header: 'Livre' },
          { key: 'enseignant', header: 'Enseignant' },
          { key: 'page', header: 'Page' },
          { key: 'numeroExercice', header: 'N°' },
          { key: 'description', header: 'Description' },
          { key: 'dateDebut', header: 'Date' },
        ];
        this.exerciceData = this.exerciceData.map((item: any) => ({
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

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.titre) {
      filtreObj.titre = this.activeFilters.titre;
    }
    if (this.activeFilters.livre) {
      filtreObj.livre = this.activeFilters.livre;
    }
    if (this.activeFilters?.enseignant) {
      filtreObj.enseignant = this.activeFilters.enseignant;
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
