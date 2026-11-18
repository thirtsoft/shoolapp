import { Component, inject } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ListEtatResponse } from '../../../../../../core/models/base/list-etat-response';
import { ActiviteScolaireRechercheRequest, TypeActiviteScolaire } from '../../../../../../core/models/planification/activite-scolaire-recherche.model';
import { CommonService } from '../../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

/* export interface ActiviteScolaireRechercheRequest {
  type?: TypeActiviteScolaire;
  etatId?: number;
  libelle?: string;
  anneeScolaireId?: number;
}

export enum TypeActiviteScolaire {
  EVENEMENT = 'EVENEMENT',
  MEETING = 'MEETING'
} */

@Component({
  selector: 'app-activites-scolaire.component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './activites-scolaire.component.html',
  styleUrl: './activites-scolaire.component.css',
})
export class ActivitesScolaireComponent {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;

  deleteEndpoint = 'activite';

  columns: any[] = [];
  activitesData: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  etatList: ListEtatResponse[] = [];
  anneeScolaireList: any[] = [];

  typeActiviteList: TypeActiviteScolaire[] = [TypeActiviteScolaire.EVENEMENT, TypeActiviteScolaire.REUNION];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);
  private readonly referentileService = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.initialiserColonnes();
    this.chargerLesDonnees(false);
    this.chargerLesFiltres();
  }
  chargerLesFiltres(): void {

    this.getStatusActivites().then(() => { this.initialisationDesFiltres(); })
      .catch(error => {
        console.error('Erreur chargement états activités:', error);
        this.initialisationDesFiltres();
      });

    this.getAnneesList().then(() => { this.initialisationDesFiltres(); })
      .catch(error => {
        console.error('Erreur chargement années scolaires:', error);
        this.initialisationDesFiltres();
      });
  }

  getStatusActivites(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getEtatsActivites().subscribe({
        next: (data) => {
          this.etatList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getAnneesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentileService
        .getResourceList('anneescolaire/response')
        .subscribe({
          next: (data) => {
            this.anneeScolaireList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  initialiserColonnes(): void {
    this.columns = [
      {
        key: 'type',
        header: 'Type'
      },
      {
        key: 'libelle',
        header: 'Libellé'
      },
      {
        key: 'date',
        header: 'Date'
      },
      {
        key: 'heure',
        header: 'Heure'
      },
      {
        key: 'etat',
        header: 'État'
      },
      {
        key: 'description',
        header: 'Description'
      }
    ];
  }

  initialisationDesFiltres(): void {
    this.tableFilters = [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: this.typeActiviteList.map(type => ({
          value: type,
          label: type === TypeActiviteScolaire.EVENEMENT ? 'Événement' : 'Réunion'
        }))
      },
      {
        key: 'libelle',
        label: 'Libellé',
        type: 'text',
        placeholder: 'Rechercher une activité ...'
      },
      {
        key: 'etatId',
        label: 'État',
        type: 'select',
        options: this.etatList.map(e => ({
          value: e?.id,
          label: e?.libelle
        }))
      },
      {
        key: 'anneeScolaireId',
        label: 'Année scolaire',
        type: 'select',
        options: this.anneeScolaireList.map(a => ({
          value: a.id,
          label: a.libelle
        }))
      }
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any): void {
    if (value === null || value === undefined || value === '') {
      delete this.activeFilters[filter.key];
    } else {
      this.activeFilters[filter.key] = value;
    }

    this.hasActiveFilters = Object.keys(this.activeFilters).length > 0;

    this.currentPage = 0;

    this.chargerLesDonnees(this.hasActiveFilters);
  }

  chargerLesDonnees(useFilterApi: boolean): void {
    this.isLoading = true;
    let apiCall;
    if (useFilterApi) {
      const filtreParam = this.construireLesParametresDeFiltre();
      apiCall = this.planificationResource.filteredFilterDataTable<any, ActiviteScolaireRechercheRequest>(
        'planification/activites-administration', this.currentPage, this.pageSize, filtreParam
      );

    } else {

      apiCall = this.planificationResource.getResourcePaged('planification/activites-administration', this.currentPage, this.pageSize);
    }

    apiCall.subscribe({
      next: (response) => {

        this.activitesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.activitesData = this.activitesData.map((item: any) => ({
          ...item,
          heure: this.formaterHeure(item.heureDebut, item.heureFin)
        }));

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Erreur chargement activités:', error);
        this.errorMessage = 'Une erreur est survenue lors du chargement des activités.';
        this.isLoading = false;
      }
    });
  }

  construireLesParametresDeFiltre(): ActiviteScolaireRechercheRequest | null {
    const filtreObj: ActiviteScolaireRechercheRequest = {};

    if (this.activeFilters.type) {
      filtreObj.type = this.activeFilters.type;
    }

    if (this.activeFilters.etatId) {
      filtreObj.etatId = this.activeFilters.etatId;
    }

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle.trim();
    }

    if (this.activeFilters.anneeScolaireId) {
      filtreObj.anneeScolaireId = this.activeFilters.anneeScolaireId;
    }

    return Object.keys(filtreObj).length > 0 ? filtreObj : null;
  }

  formaterHeure(heureDebut?: string, heureFin?: string): string {
    if (!heureDebut) {
      return '';
    }

    const debut = heureDebut.substring(0, 5);

    if (!heureFin) {
      return debut;
    }

    const fin = heureFin.substring(0, 5);

    return `${debut} - ${fin}`;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number): void {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;

      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string): void {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {

      this.pageSize = newSize;
      this.currentPage = 0;

      this.chargerLesDonnees(this.hasActiveFilters);
    }
  }

  resetFilters(): void {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }
}
