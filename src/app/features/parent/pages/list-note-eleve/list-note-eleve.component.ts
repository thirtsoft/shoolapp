import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Subject } from 'rxjs';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../administration/referentiel/service/referentiel.service';
import { ParentSessionService } from '../../service/parent-session.service';

@Component({
  selector: 'app-list-note-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-note-eleve.component.html',
  styleUrls: ['./list-note-eleve.component.css']
})
export class ListNoteEleveComponent implements OnInit {
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataNote: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  noteData: any = [];

  private readonly destroy$ = new Subject<void>();

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
  moisList: any[] = [];
  typesNoteOptions: string[] = ['DEVOIR', 'COMPOSITION'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;


  nomEleveConcerne = '';

  private readonly parentSession = inject(ParentSessionService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly coursService = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);

  constructor(
  ) {

    const eleve = this.parentSession.getEleveResume();

    if (eleve) {
      this.eleveId = eleve.id;
      this.classeId = eleve.classeId;
      this.nomEleveConcerne = `${eleve.prenom ?? ''} ${eleve.nom ?? ''}`.trim();
    }

  }

  ngOnInit(): void {
    this.chargerLesNotesEleve();
  }

  private chargerLesNotesEleve(): void {
    this.isLoading = true;

    forkJoin({
      semestres: this.referentielResourceService.getResourceList('sessionsemestre'),
      mois: this.commonService.getAllMois(),
      matiere: this.referentielService.getAllMatieres()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {

          this.sessionSemestreList = result.semestres || [];
          this.moisList = result.mois || [];
          this.matieresList = result.matiere || []

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
        options: this.sessionSemestreList.map(c => ({
          value: c.id,
          label: c.semestre
        }))
      },

      {
        key: 'type',
        label: 'Type de note',
        type: 'select',
        options: this.typesNoteOptions.map(n => ({
          value: n,
          label: n
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
      }

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
    console.log('élève ID', this.eleveId);

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.coursService.fetchFilterByElementDataTable(
        'note/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourceByIdPaged('note/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Notes élèves', response);
        this.noteData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'matiere', header: 'Matière' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'note', header: 'Note' },
          { key: 'type', header: 'Type' },
          { key: 'dateCreationFormatee', header: 'Date' }
        ];

        this.noteData = this.noteData.map((item: any) => ({
          ...item,
          dateCreationFormatee: this.formaterDate(item.dateCreation)
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  formaterDate(date: string | null | undefined): string {
    if (!date) {
      return '';
    }

    const dateObj = new Date(date);

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  }

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters?.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }
    if (this.activeFilters.type) {
      filtreObj.type = this.activeFilters.type;
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
