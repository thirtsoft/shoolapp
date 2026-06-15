import { Component, inject, OnInit } from '@angular/core';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { EnseignantService } from '../../../service/enseignant.service';
import { CommonService } from '../../../../../core/services/common.service';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

@Component({
  selector: 'app-mes-conges-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './mes-conges-component.html',
  styleUrl: './mes-conges-component.css',
})
export class MesCongesComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataConges: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "conges";
  columns: any = [];
  congesData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  moisList: any[] = [];
  anneeScolaireList: any[] = [];
  detailsEnseignant: DetailsEnseignantUtilisateur = {};

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  userId: number;
  enseignantId?: number;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);
  private readonly referentielService = inject(ReferentielService)
  private readonly enseignantSerivce = inject(EnseignantService);

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
    if (this.userId && this.userId != undefined) {

    }
  }

  ngOnInit(): void {
    if (this.userId && this.userId != undefined) {
      this.chargerLesCongesEnseignant();
    }
  }


  async chargerLesCongesEnseignant() {
    try {
      await Promise.all([
        this.getMoisList(),
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
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
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        }))
      }
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

      apiCall = this.planificationResource.fetchFilterByElementDataTable(
        'conges/demandeur',
        this.userId,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourceByIdPaged('conges/demandeur', this.userId, this.currentPage, this.pageSize);
    } apiCall.subscribe({
      next: (response) => {
        this.congesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'objet', header: 'Objet' },
          { key: 'motif', header: 'Motif rejét' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateDebut', header: 'Date début' },
          { key: 'dateFin', header: 'Date Fin' },

        ];
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

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.anneeScolaire) {
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


