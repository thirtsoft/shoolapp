import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';

@Component({
  selector: 'app-list-course-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-course-eleve.component.html',
  styleUrls: ['./list-course-eleve.component.css']
})
export class ListCourseEleveComponent implements OnInit {

  isLoading: boolean = false;
  filteredDataCours: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  coursData: any = [];

  matieresList: any[] = [];
  classeList: any[] = [];
  salleList: any[] = [];
  moisList: any[] = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];


  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesCoursDeLaClasseEleve();

  }

  async chargerLesCoursDeLaClasseEleve() {
    try {
      const [matieres, salles, mois] = await Promise.all([
        this.getMatiereList(),
        this.getSalleList(),
        this.getMoistList(),
      ]);
      this.initialisationDesFiltres(matieres, salles, mois);
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  private getMatiereList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentielResourceService.getResourceList('matiere').pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.matieresList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  private getSalleList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentielResourceService.getResourceList('salle').pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.salleList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  private getMoistList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllMois().pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.moisList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  initialisationDesFiltres(matieres: any[], salles: any[], mois: any[]) {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libellé cours',
        type: 'text',
        placeholder: 'Rechercher un cours...'
      },
      {
        key: 'matiere',
        label: 'Matiere',
        type: 'select',
        options: matieres.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
      {
        key: 'salle',
        label: 'Salle',
        type: 'select',
        options: salles.map(n => ({
          value: n.id,
          label: n.libelle
        })),
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

      const filtreParam = this.construireLesParamereDeFiltre();

      apiCall = this.coursService.fetchFilterByElementDataTable(
        'planification/cours/byclasse',
        this.classeId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourceByIdPaged('planification/cours/byclasse', this.classeId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.coursData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'eleve', header: 'Elève' },
          { key: 'libelleClasse', header: 'Classe' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'dateInscription', header: 'Date' },
        ];

        this.coursData = this.coursData.map((item: any) => ({
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

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};
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
    this.initialisationDesFiltres(this.matieresList, this.salleList, this.moisList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }
}

