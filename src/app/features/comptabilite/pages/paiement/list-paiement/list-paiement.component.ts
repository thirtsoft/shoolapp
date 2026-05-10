import { Component, inject, OnInit } from '@angular/core';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { CommonService } from '../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

@Component({
  selector: 'app-list-paiement',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-paiement.component.html',
  styleUrls: ['./list-paiement.component.css']
})
export class ListPaiementComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = false;
  isLoading: boolean = false;
  filteredPaiementData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "paiement";
  columns: any = [];
  paiementData: any = [];

  isView: boolean = true;
  public readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneeList: any[] = [];
  moisList: any[] = [];
  moyenPaiementList: MoyenPaiement[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService)
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesPaiements();
  }

  async chargerLesPaiements() {
    try {
      await Promise.all([
        this.getMoyenPaiementList(),
        this.getMoisList(),
        this.getAnneesList()
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

  getMoyenPaiementList(): Promise<MoyenPaiement[]> {
    return new Promise((resolve, reject) => {
      this.referentielResource.getResourceList('moyenpaiement').subscribe({
        next: (data:any) => {
          this.moyenPaiementList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }


  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'numeroFacture',
        label: 'N° facture',
        type: 'text',
        placeholder: 'Rechercher un paiement...'
      },
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un paiement...'
      },
      {
        key: 'moyen',
        label: 'Moyen paiement',
        type: 'select',
        options: this.moyenPaiementList.map(m => ({
          value: m.id,
          label: m.libelle
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
      {
        key: 'annee',
        label: 'Année',
        type: 'select',
        options: this.anneeList.map(a => ({
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

      apiCall = this.comptabiliteResource.fetchFilterDataTable(
        'payement',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourcePaged('payement', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.paiementData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'facture', header: 'N° facture' },
          { key: 'nomCompletEleve', header: 'Elève' },
          { key: 'moyenPaiement', header: 'Moyen paiement' },
          { key: 'montant', header: 'Montant' },
          { key: 'datePaiement', header: 'Date' },
        ];

        this.paiementData = this.paiementData.map((item: any) => ({
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

    if (this.activeFilters.numeroFacture) {
      filtreObj.numeroFacture = this.activeFilters.numeroFacture;
    }

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }

    if (this.activeFilters.moyen) {
      filtreObj.moyen = this.activeFilters.moyen;
    }
    if (this.activeFilters?.mois) {
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
