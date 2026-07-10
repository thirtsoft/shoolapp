import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';
import { Etat } from '../../../../referentiel/pages/semestre/editer-session-semestre-component/editer-session-semestre-component';
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
  noteId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEvaluation: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "evaluation";
  columns: any = [];
  evaluationData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

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

  filteredEnseignementList: any[] = [];

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

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesEvaluations();
  }

  async chargerLesEvaluations() {
    try {
      await Promise.all([
        this.getClassList(),
        this.getEtatEvaluationList(),
        this.getMoisList(),
        this.getAnneesList(),
        this.getSessionSemestreList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }


  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data: any) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
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
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classesList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
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
        options: this.sessionSemestreList.map(s => ({
          value: s.id,
          label: `${s.semestre}`
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
        'evaluation',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.dossierResource.getResourcePaged('evaluation', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evaluationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matière' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'evaluationType', header: 'Type' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateEvaluation', header: 'Date' },

        ];
        this.evaluationData = this.evaluationData?.map((item: any) => ({
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
    if (this.activeFilters.enseignement) {
      filtreObj.enseignement = this.activeFilters.enseignement;
    }
    if (this.activeFilters?.sessionSemestre) {
      filtreObj.sessionSemestre = this.activeFilters.sessionSemestre;
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


  canEditOrDeleteEvaluation(item: any): boolean {
    return item.etat !== 'Validée';
  }


}
