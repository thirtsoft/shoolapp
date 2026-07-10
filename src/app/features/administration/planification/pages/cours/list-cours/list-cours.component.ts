import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { CommonService } from '../../../../../../core/services/common.service';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';

@Component({
  selector: 'app-list-cours',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-cours.component.html',
  styleUrls: ['./list-cours.component.css']
})
export class ListCoursComponent implements OnInit {
  errorMessage?: string;
  today = new Date();
  coursId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataCours: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "cours";
  columns: any = [];
  coursData: any = [];
  public readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  matieresList: any[] = [];
  salleList: any[] = [];
  enseignantList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  private readonly coursService = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesCours();
  }

  async chargerLesCours() {
    try {
      const [matieres, enseignants, salles] = await Promise.all([
        this.getMatiereList(),
        this.getEnseignantList(),
        this.getSalleList(),
        this.getMoistList(),
        this.getAnneetList()

      ]);

      this.initialisationDesFiltres(matieres, enseignants, salles);
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

  getSalleList(): Promise<Salle[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSalles().subscribe({
        next: (data) => {
          this.salleList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getEnseignantList(): Promise<EnseigantList[]> {
    return new Promise((resolve, reject) => {
      this.enseignantService.getAllEnseignants().subscribe({
        next: (data: any) => {
          this.enseignantList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getMoistList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllMois().subscribe({
        next: (data) => {
          this.moisList = data;
          console.log('mois list', this.moisList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getAnneetList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllAnnees().subscribe({
        next: (data) => {
          this.anneesList = data;
          console.log('Année list', this.anneesList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres(matieres: any[], enseignants: any[], salles: any[]) {
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
        options: matieres.map(m => ({
          value: m.id,
          label: m.libelle
        })),
      },
      {
        key: 'enseignant',
        label: 'Enseignant',
        type: 'select',
        options: enseignants.map(e => ({
          value: e.id,
          label: `${e.nomComplet}`
        }))
      },
      {
        key: 'salle',
        label: 'Salle',
        type: 'select',
        options: salles.map(s => ({
          value: s.id,
          label: s.libelle
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.coursService.fetchFilterDataTable(
        'planification/cours',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.coursService.getResourcePaged('planification/cours', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.coursData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'libelle', header: 'Libelle' },
          { key: 'matiere', header: 'Matière' },
          { key: 'salle', header: 'Salle' },
          { key: 'enseignant', header: 'Enseignant' },
          { key: 'dateDebut', header: 'Date' },
          { key: 'heureDebut', header: 'heure début' },
          { key: 'heureFin', header: 'heure fin' },

        ];
        this.coursData = this.coursData?.map((item: any) => ({
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

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
    }
    if (this.activeFilters.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
    }
    if (this.activeFilters.enseignant) {
      filtreObj.enseignant = this.activeFilters.enseignant;
    }
    if (this.activeFilters?.salle) {
      filtreObj.salle = this.activeFilters.salle;
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
    this.initialisationDesFiltres(this.matieresList, this.enseignantList, this.salleList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }


}