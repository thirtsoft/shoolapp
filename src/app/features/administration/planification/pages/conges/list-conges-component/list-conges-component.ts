import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { CommonService } from '../../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { Etat } from '../../../../referentiel/pages/semestre/editer-session-semestre-component/editer-session-semestre-component';
import { UtilisateurList } from '../../../../../../core/models/utilisateur/utilisateur-list';

@Component({
  selector: 'app-list-conges-component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-conges-component.html',
  styleUrl: './list-conges-component.css',
})
export class ListCongesComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataConges: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "conges";
  columns: any = [];
  congesData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  statusEvenementOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];
  etatCongesList: Etat[] = [
    {
      id: 8,
      code: 'E8',
      libelle: 'En cours',

    },
    {
      id: 3,
      code: 'E3',
      libelle: 'Envoyée',

    },
    {
      id: 15,
      code: 'E15',
      libelle: 'Accepte',

    },
    {
      id: 16,
      code: 'E16',
      libelle: 'Rejete',

    }
  ];
  demanderCongesList: UtilisateurList[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);

  ngOnInit(): void {
    this.chargerLesConges();
  }

  async chargerLesConges() {
    try {
      await Promise.all([
        this.getMoisList(),
        this.getAnneesList(),
        this.getDemanderCongesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

   getDemanderCongesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.planificationResource.getResourceList('utilisateur/demandeur-conges').subscribe({
        next: (data:any) => {
          this.demanderCongesList = data;
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
        key: 'objet',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un congé...'
      },
       {
        key: 'demandeurId',
        label: 'Demandeur',
        type: 'select',
        options: this.demanderCongesList.map(d => ({
          value: d.id,
          label: d.nomComplet
        }))
      },

      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatCongesList.map(e => ({
          value: e.id,
          label: e.libelle
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

      apiCall = this.planificationResource.fetchFilterDataTable(
        'conges',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('conges', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.congesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'objet', header: 'Objet' },
          { key: 'demandeur', header: 'Demandeur' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateDebut', header: 'Date début' },
          { key: 'dateFin', header: 'Date fin' },
        ]

        this.congesData = this.congesData.map((item: any) => ({
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

    if (this.activeFilters.objet) {
      filtreObj.objet = this.activeFilters.objet;
    }
    if (this.activeFilters.demandeurId) {
      filtreObj.demandeurId = this.activeFilters.demandeurId;
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

}

