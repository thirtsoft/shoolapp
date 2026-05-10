import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { CommonService } from '../../../../../../core/services/common.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

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

  public readonly String = String;

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

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  //  private readonly enseigantService = inject(EnseignantService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesExercices();
  }

  async chargerLesExercices() {
    try {
      await Promise.all([
        this.getClassList(),
        this.getLivreList(),
        //  this.getEnseignantList(),
        this.getMoisList(),
        this.getAnneesList(),
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
        next: (data) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
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

  /*
  getEnseignantList(): Promise<EnseigantList[]> {
    return new Promise((resolve, reject) => {
      this.enseigantService.getAllEnseignants().subscribe({
        next: (data:any) => {
          this.enseignantList = data;
          console.log('List livre', this.enseignantList);
          resolve(data);
        },
        error: (err:any) => reject(err)
      });
    });
  }*/

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
          this.anneesList = data;
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
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classesList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
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
        key: 'enseignant',
        label: 'Enseignant',
        type: 'select',
        options: this.enseignantList.map(a => ({
          value: a.id,
          label: `${a.nomComplet}`
        }))
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
      {
        key: 'annee',
        label: 'Année',
        type: 'select',
        options: this.anneesList.map(a => ({
          value: a.annee,
          label: a.annee
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
        'exercice',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('exercice', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.exerciceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'livre', header: 'Livre' },
          { key: 'classe', header: 'Classe' },
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

    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
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
