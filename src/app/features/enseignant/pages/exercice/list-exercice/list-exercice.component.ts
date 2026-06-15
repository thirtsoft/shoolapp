import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { CommonService } from '../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-list-exercice',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-exercice.component.html',
  styleUrls: ['./list-exercice.component.css']
})
export class ListExerciceComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataExercice: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "exercice";
  columns: any = [];
  exerciceData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  livreList: any;
  classesList: any[] = [];
  enseignantList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;
  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  userId: number;
  enseignantId?: number;
  classeId?: number;
  titile: string = '';

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);
  private readonly classeContext = inject(EnseignementContextService);

  readonly libelleClasse = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.classe || '5ème A';
  });

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
    effect(() => {
      const activeClasseId = this.classeContext.activeClasseId();
      console.log('active classe is', this.classeId);
      if (activeClasseId) {
        this.classeId = Number(activeClasseId);
         this.chargerLesExercices();
      }
    });
  }

  ngOnInit(): void {
   
  }

  async chargerLesExercices() {
    try {
      await Promise.all([
        this.getLivreList(),
        this.getMoisList(),
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getLivreList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.planificationResource.getResourceList('livre').subscribe({
        next: (data) => {
          this.livreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
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

      apiCall = this.planificationResource.fetchFilterDataTable(
        'planification/exercice/classe',
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
          { key: 'page', header: 'Page' },
          { key: 'numeroExercice', header: 'N°' },
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
