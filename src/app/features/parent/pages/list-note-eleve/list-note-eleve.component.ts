import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ListeClasse } from '../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../core/models/referentiels/matiere';
import { Semestre } from '../../../../core/models/referentiels/semestre';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../administration/referentiel/service/referentiel.service';
import { ParentSessionService } from '../../service/parent-session.service';

@Component({
  selector: 'app-list-note-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-note-eleve.component.html',
  styleUrls: ['./list-note-eleve.component.css']
})
export class ListNoteEleveComponent implements OnInit, OnDestroy {
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
  semestreList: any[] = [];
  typesNoteOptions: string[] = ['devoir', 'composition'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly sessionService = inject(ParentSessionService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesNotesEleve();
    this.sessionService.changement$
      .pipe(takeUntil(this.destroy$))
      .subscribe((changement) => {
        console.log('📩 Notification reçue dans ListNote:', changement);
        if (changement && changement.eleveId !== this.eleveId) {
          console.log('🔄 Rechargement pour eleveId:', changement.eleveId);
          this.eleveId = changement.eleveId;
          this.classeId = changement.classeId!;

          this.currentPage = 0;
          this.activeFilters = {};
          this.hasActiveFilters = false;
          this.chargerLesNotesEleve();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async chargerLesNotesEleve() {
    try {
      const [matiere, semestre] = await Promise.all([
        this.getMatiereList(),
        this.getSemestreList()
      ]);

      this.initialisationDesFiltres(matiere, semestre);
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMatiereList(): Promise<Matiere[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllMatieres().subscribe({
        next: (data) => {
          this.matieresList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSemestres().subscribe({
        next: (data) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres(matieres: any[], semestre: any[]) {
    this.tableFilters = [
      {
        key: 'matiere',
        label: 'Matière',
        type: 'select',
        options: matieres.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: semestre.map(a => ({
          value: a.id,
          label: `${a.libelle}`
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
          { key: 'semestre', header: 'Semestre' },
          { key: 'note', header: 'Note' },
          { key: 'type', header: 'Type' },

        ];
        this.noteData = this.noteData?.map((item: any) => ({
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

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
    }
    if (this.activeFilters?.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }
    if (this.activeFilters.type) {
      filtreObj.type = this.activeFilters.type;
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
    this.initialisationDesFiltres(this.matieresList, this.semestreList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }


}
