import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-list-enseignement',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-enseignement.component.html',
  styleUrls: ['./list-enseignement.component.css']
})
export class ListEnseignementComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEnseignement: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "enseignement";
  columns: any = [];
  enseignementData: any = [];

  public readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  enseignantList: any[] = [];
  classeList: any[] = [];
  anneeScolaireList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  //  private readonly enseignantSerivce = inject(EnseignantService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.chargerLesEnseignements();
  }


  async chargerLesEnseignements() {
    try {
      await Promise.all([
        //    this.getEnseignantList(),
        this.getClasseList(),
        this.getAnneesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  /*
  getEnseignantList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.enseignantSerivce.getAllEnseignants().subscribe({
        next: (data) => {
          this.enseignantList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }*/

  getClasseList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data) => {
          this.classeList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getAnneesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllAnneeScolaires().subscribe({
        next: (data) => {
          this.anneeScolaireList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'enseignant',
        label: 'Enseignant',
        type: 'select',
        options: this.enseignantList.map(e => ({
          value: e.id,
          label: e.nomComplet
        })),
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classeList.map(c => ({
          value: c.id,
          label: `${c.libelle}`
        }))
      },
      {
        key: 'anneeScolaire',
        label: 'Année scolaire',
        type: 'select',
        options: this.anneeScolaireList.map(a => ({
          value: a.id,
          label: a.libelle
        })),
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
        'planification/enseignement',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('planification/enseignement', this.currentPage, this.pageSize);
    } apiCall.subscribe({
      next: (response) => {
        this.enseignementData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'enseignant', header: 'Enseignant' },
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matière' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'dateDebut', header: 'Date' },
        ];
        this.enseignementData = this.enseignementData.map((item: any) => ({
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

    if (this.activeFilters.enseignant) {
      filtreObj.enseignant = this.activeFilters.enseignant;
    }

    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }

    if (this.activeFilters.anneeScolaire) {
      filtreObj.anneeScolaire = this.activeFilters.anneeScolaire;
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
