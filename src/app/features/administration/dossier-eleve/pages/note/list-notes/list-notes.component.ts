import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-list-notes',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.css']
})
export class ListNotesComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataNote: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "note";
  columns: any = [];
  noteData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  ensegnementList: any[] = [];
  filteredEnseignementList: any[] = [];
  classesList: any[] = [];
  sessionSemestreList: any[] = [];
  typesNoteOptions: string[] = ['DEVOIR', 'COMPOSITION'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesNotes();
  }

  async chargerLesNotes() {
    try {
      await Promise.all([
        this.getClassList(),
        this.getSessionSemestreList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  chargerEnseignementsParClasse(classeId: number): Promise<any[]> {
    return new Promise((resolve, reject): any => {
      if (!classeId) {
        return [];
      }
      console.log('Chargement des enseignements pour la classe:', classeId);
      this.dossierResource.getResourceList(`planification/enseignement/by-classe/${classeId}`).subscribe({
        next: (data) => {
          console.log('Enseignements reçus:', data);
          this.filteredEnseignementList = data || [];
          this.mettreAJourFiltreEnseignement();
          resolve(data);
        },
        error: (err) => {
          console.error('Erreur chargement enseignements:', err);
        }
      });
    });
  }

  mettreAJourFiltreEnseignement() {
    const enseignementFilterIndex = this.tableFilters.findIndex(f => f.key === 'enseignement');
    if (enseignementFilterIndex !== -1) {

      const updatedFilter = {
        ...this.tableFilters[enseignementFilterIndex],
        options: this.filteredEnseignementList.map(e => ({
          value: e.id,
          label: e.matiere || e.libelle || e.nom || 'Sans nom'
        })),
        disabled: this.filteredEnseignementList.length === 0,
        placeholder: this.filteredEnseignementList.length === 0
          ? 'Aucune matière disponible'
          : 'Sélectionnez une matière'
      };

      if (this.activeFilters.enseignement && this.filteredEnseignementList.length > 0) {
        const enseignementExists = this.filteredEnseignementList.some(
          e => e.id === this.activeFilters.enseignement
        );
        if (!enseignementExists) {
          this.activeFilters.enseignement = null;
        }
      }

      this.tableFilters = [
        ...this.tableFilters.slice(0, enseignementFilterIndex),
        updatedFilter,
        ...this.tableFilters.slice(enseignementFilterIndex + 1)
      ];
    }
  }

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getResourceList('classe').subscribe({
        next: (data: any) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getSessionSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getResourceList('sessionsemestre').subscribe({
        next: (data: any) => {
          this.sessionSemestreList = data;
          console.log('session semestre', this.sessionSemestreList)
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classesList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
        placeholder: 'Selectionnez une classe'
      },

      {
        key: 'enseignement',
        label: 'Matière',
        type: 'select',
        options: [],
        disabled: true,
        placeholder: 'Sélectionnez une classe'
      },

      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(a => ({
          value: a.id,
          label: `${a.semestre}`
        })),
        placeholder: 'Selectionnez un semestre'
      },
      {
        key: 'type',
        label: 'Type de note',
        type: 'select',
        options: this.typesNoteOptions.map(n => ({
          value: n,
          label: n
        })),
        placeholder: 'Selectionnez type note'
      },
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    if (filter.key === 'classe' && value !== this.activeFilters.classe) {
      this.activeFilters.enseignement = null;
      this.chargerEnseignementsParClasse(value);
    }
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.dossierResource.fetchFilterDataTable(
        'note',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.dossierResource.getResourcePaged('note', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.noteData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'eleve', header: 'Eleve' },
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matière' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'note', header: 'Note' },
          { key: 'type', header: 'Type de note' },

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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }

    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters.enseignement) {
      filtreObj.enseignement = this.activeFilters.enseignement;
    }
    if (this.activeFilters?.sessionSemestre) {
      filtreObj.sessionSemestre = this.activeFilters.sessionSemestre;
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
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

}
