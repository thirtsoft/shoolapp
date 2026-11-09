import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

interface ParentRelanceRechercheResponse {
  uuid: string;
  nomComplet: string;
}

interface CreateurRelanceRechercheResponse {
  uuid: string;
  nomComplet: string;
}

@Component({
  selector: 'app-list-relance-parent-eleve-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-relance-parent-eleve-component.html',
  styleUrl: './list-relance-parent-eleve-component.css',
})
export class ListRelanceParentEleveComponent implements OnInit {

  isEdit: boolean = false;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;

  deleteEndpoint = 'relance';

  columns: any[] = [];
  relanceData: any[] = [];

  isView: boolean = true;
  isViewPopup: boolean = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  tableSizes = [10, 20, 50, 100];

  listParenRelance: ParentRelanceRechercheResponse[] = [];
  listCreateurRelance: CreateurRelanceRechercheResponse[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesRelances();
  }


  async chargerLesRelances() {

    try {

      await Promise.all([
        this.getParentRelances(),
        this.getCreateurRelances()
      ]);

      this.initialisationDesFiltres();

      this.chargerLesDonnees(false);

    } catch (error) {

      console.error(
        'Erreur chargement données:',
        error
      );

    }
  }

  getParentRelances(): Promise<ParentRelanceRechercheResponse[]> {

    return new Promise((resolve, reject) => {

      this.comptabiliteResource
        .getResourceList<ParentRelanceRechercheResponse>('relances/parents')
        .subscribe({

          next: (response) => {

            this.listParenRelance = response || [];

            resolve(this.listParenRelance);
          },

          error: (err) => reject(err)

        });
    });
  }

  getCreateurRelances(): Promise<CreateurRelanceRechercheResponse[]> {

    return new Promise((resolve, reject) => {

      this.comptabiliteResource
        .getResourceList<CreateurRelanceRechercheResponse>('relances/parents')
        .subscribe({

          next: (response) => {

            this.listCreateurRelance = response || [];

            resolve(this.listCreateurRelance);
          },

          error: (err) => reject(err)

        });
    });
  }

  initialisationDesFiltres(): void {

    this.tableFilters = [

      {
        key: 'parentUuid',
        label: 'Parent',
        type: 'select',
        options: this.listParenRelance.map(parent => ({
          value: parent.uuid,
          label: parent.nomComplet
        }))
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
          {
            value: 'ECHEANCE_DEPASSEE',
            label: 'Échéance dépassée'
          },
          {
            value: 'PAIEMENT_EN_RETARD',
            label: 'Paiement en retard'
          },
          {
            value: 'PAIEMENT_PARTIEL',
            label: 'Paiement partiel'
          }
        ]
      },

      {
        key: 'statut',
        label: 'État',
        type: 'select',
        options: [
          {
            value: 'ACCEPTABLE',
            label: '🟢'
          },
          {
            value: 'WARNING',
            label: '🟠'
          },
          {
            value: 'CRITIQUE',
            label: '🔴'
          }
        ]
      }

    ];
  }


  onFilterChange(filter: IFilterConfig, value: any): void {

    this.activeFilters[filter.key] = value;

    this.hasActiveFilters =
      Object.values(this.activeFilters).some(
        val => val !== null && val !== undefined && val !== ''
      );

    this.currentPage = 0;
    this.chargerLesDonnees(this.hasActiveFilters);
  }


chargerLesDonnees(useFilterApi: boolean): void {
  this.isLoading = true;

  let apiCall;

  if (useFilterApi) {

    const filtreParam = this.construireLesParamereDeFiltre();

    apiCall = this.comptabiliteResource.fetchRelancesFilteredDataTable(
      this.currentPage,
      this.pageSize,
      filtreParam
    );

  } else {

    apiCall = this.comptabiliteResource.getResourcePaged(
      'relances',
      this.currentPage,
      this.pageSize
    );
  }

  apiCall.subscribe({

    next: (response) => {

      this.totalElements = response.data?.totalElements || 0;

      this.columns = [
        {
          key: 'code',
          header: 'Code'
        },
        {
          key: 'nomCompletParent',
          header: 'Parent'
        },
        {
          key: 'type',
          header: 'Type'
        },
        {
          key: 'montantDu',
          header: 'Montant dû'
        },
        {
          key: 'statut',
          header: 'État'
        },
        {
          key: 'joursRetard',
          header: 'Retard'
        },
        {
          key: 'dateRelance',
          header: 'Date de relance'
        }
      ];

      this.relanceData =
        (response.data?.content || [])
          .map((item: any) => ({
            ...item,

            type: this.getTypeRelanceLabel(item.type),

            statut: this.getStatutRelanceIcon(item.statut),

            montantDu: this.formatMontant(item.montantDu),

            joursRetard: this.formatJoursRetard(item.joursRetard),

            dateRelance: this.formatDateRelance(item.dateRelance)
          }));

      this.isLoading = false;
    },

    error: (error) => {

      console.error('Erreur:', error);

      this.isLoading = false;
    }

  });
}

  getTypeRelanceLabel(type: string): string {

    switch (type) {

      case 'ECHEANCE_DEPASSEE':
        return 'Échéance dépassée';

      case 'PAIEMENT_EN_RETARD':
        return 'Paiement en retard';

      case 'PAIEMENT_PARTIEL':
        return 'Paiement partiel';

      default:
        return type || '-';
    }
  }


  getStatutRelanceIcon(statut: string): string {

    switch (statut) {

      case 'ACCEPTABLE':
        return '🟢';

      case 'WARNING':
        return '🟠';

      case 'CRITIQUE':
        return '🔴';

      default:
        return '-';
    }
  }


  formatMontant(montant: number): string {

    if (
      montant === null ||
      montant === undefined
    ) {
      return '-';
    }

    return new Intl.NumberFormat(
      'fr-FR',
      {
        maximumFractionDigits: 0
      }
    ).format(montant) + ' FCFA';
  }


  formatJoursRetard(
    joursRetard: number
  ): string {

    if (
      joursRetard === null ||
      joursRetard === undefined
    ) {
      return '-';
    }

    return `${joursRetard} jour${joursRetard > 1 ? 's' : ''
      }`;
  }


  formatDateRelance(
    date: string
  ): string {

    if (!date) {
      return '-';
    }

    const value = new Date(date);

    return value.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ) + ' ' +
      value.toLocaleTimeString(
        'fr-FR',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }


  construireLesParamereDeFiltre(): any {

    const filtreObj: any = {};


    if (this.activeFilters.parentUuid) {

      filtreObj.parentUuid =
        this.activeFilters.parentUuid;
    }

    if (this.activeFilters.type) {

      filtreObj.type =
        this.activeFilters.type;
    }


    if (this.activeFilters.statut) {

      filtreObj.statut =
        this.activeFilters.statut;
    }


    return Object.keys(filtreObj).length > 0
      ? filtreObj
      : null;
  }


  get totalPages(): number {

    return Math.ceil(
      this.totalElements /
      this.pageSize
    );
  }


  changePage(
    pageNumber: number
  ): void {

    if (
      pageNumber >= 0 &&
      pageNumber < this.totalPages
    ) {

      this.currentPage =
        pageNumber;

      this.chargerLesDonnees(
        this.hasActiveFilters
      );
    }
  }


  changeSize(
    size: number | string
  ): void {

    const newSize =
      typeof size === 'string'
        ? parseInt(size, 10)
        : size;

    if (
      this.pageSize !== newSize
    ) {

      this.pageSize =
        newSize;

      this.currentPage = 0;

      this.chargerLesDonnees(
        this.hasActiveFilters
      );
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