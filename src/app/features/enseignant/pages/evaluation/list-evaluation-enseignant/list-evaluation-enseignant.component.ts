import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { Matiere } from '../../../../../core/models/referentiels/matiere';
import { SessionSemestre } from '../../../../../core/models/referentiels/session-semestre';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { EnseignantService } from '../../../service/enseignant.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-list-evaluation-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-evaluation-enseignant.component.html',
  styleUrls: ['./list-evaluation-enseignant.component.css']
})
export class ListEvaluationEnseignantComponent implements OnInit {

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
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  classesList: any[] = [];
  matiereList: any[] = [];
  semestreList: any[] = [];
  enseignementList: ListeEnseignement[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;
  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  userId: number;
  enseignantId?: number;
  classeId?: number;
  titile: string = '';


  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly classeContext = inject(EnseignementContextService);

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
    this.userId = Number(localStorage.getItem('id'));
    effect(() => {
      const activeClassId = Number(this.classeContext.activeClasseId());
      console.log('active classe is', activeClassId);
      if (activeClassId) {
        this.classeId = Number(activeClassId);
        this.chargerLesEvaluations();
      }
    });
  }

  readonly libelleClasse = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.classe;
  });

  ngOnInit(): void {

  }

  async chargerLesEvaluations() {
    try {
      const [matiere, semestre] = await Promise.all([
        this.getMatiereList(),
        this.getSemestreList(),
      ]);

      this.initialisationDesFiltres(matiere, semestre);
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMatiereList(): Promise<Matiere[]> {
    return new Promise((resolve, reject) => {
      this.referentielResourceService.getResourceList('matiere').subscribe({
        next: (data: any) => {
          this.matiereList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<SessionSemestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielResourceService.getResourceList('sessionsemestre').subscribe({
        next: (data: any) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getEnseignementList(enseignantId: number): Promise<ListeEnseignement[]> {
    return new Promise((resolve, reject) => {
      this.planification.getAllEnseignementByEnseignant(enseignantId).subscribe({
        next: (data) => {
          this.enseignementList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres(matieres: any[], semestre: any[]) {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.dossierResource.fetchFilterByElementDataTable(
        'evaluation/classe',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planification.getResourceByIdPaged('evaluation/classe', this.classeId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evaluationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'matiere', header: 'Matière' },
          { key: 'semestre', header: 'Semestre' },
          { key: 'evaluationType', header: 'Type' },
          { key: 'etat', header: 'Etat' },
          { key: 'datePublication', header: 'Date' },

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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
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
    this.initialisationDesFiltres(this.matiereList, this.semestreList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }


}
