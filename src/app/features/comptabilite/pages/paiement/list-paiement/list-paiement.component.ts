import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { CommonService } from '../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { RechercherPaiement } from '../../../../../core/models/comptabilite/rechercher-paiement';
import { DataResult } from '../../../../../core/datamodel/data-model';

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
  readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  anneeList: any[] = [];
  moisList: any[] = [];
  moyenPaiementList: MoyenPaiement[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: Partial<RechercherPaiement> = {};
  hasActiveFilters: boolean = false;


  typePaiement: string[] = ['FACTURE', 'SALAIRE', 'AUTRE'];



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
        next: (data: any) => {
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
        key: 'beneficiaire',
        label: 'Bénéficiaire',
        type: 'text',
        placeholder: 'Rechercher un paiement...'
      },
      {
        key: 'moyen',
        label: 'Moyen paiement',
        type: 'select',
        options: this.moyenPaiementList.map(m => ({
          value: m.uuid,
          label: m.libelle
        })),
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: this.typePaiement.map(m => ({
          value: m,
          label: m
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

  onFilterChange(filter: IFilterConfig, value: any): void {

    this.activeFilters[filter.key as keyof RechercherPaiement] = value;

    this.hasActiveFilters = Object.values(this.activeFilters).some(
      value => value !== null &&
        value !== undefined &&
        value !== ''
    );

    this.currentPage = 0;

    this.chargerLesDonnees(this.hasActiveFilters);
  }

  chargerLesDonnees(useFilterApi: boolean): void {
    this.isLoading = true;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametresDeFiltre();

      console.log('Param filtre facture:', filtreParam);

      this.comptabiliteResource.filteredFilterDataTable<any, RechercherPaiement>(
        'payement', this.currentPage, this.pageSize, filtreParam
      )
        .subscribe({
          next: (response) => {
            this.traiterReponsePaiements(response);
          },
          error: (error) => {
            console.error('Erreur chargement factures filtrées:', error);
            this.isLoading = false;
          }
        });

    } else {

      this.comptabiliteResource.getResourcePaged<any>('payement', this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.traiterReponsePaiements(response);
          },
          error: (error) => {
            console.error('Erreur chargement paiement:', error);
            this.isLoading = false;
          }
        });
    }
  }

  private traiterReponsePaiements(response: DataResult<any>): void {

    this.paiementData = response.data?.content || [];
    this.totalElements = response.data?.totalElements || 0;

    this.paiementData = this.paiementData.map((item: any) => ({
      ...item,

      numeroDocument:
        item.typePaiement === 'SALAIRE'
          ? item.numeroPaie
          : item.facture,

      nomCompletBeneficiaire:
        item.typePaiement === 'SALAIRE'
          ? item.nomCompletPersonnel
          : item.nomCompletEleve,

      pay: ''
    }));

    this.columns = [
      { key: 'numeroDocument', header: 'N°' },
      { key: 'typePaiement', header: 'Type' },
      { key: 'nomCompletBeneficiaire', header: 'Bénéficiaire' },
      { key: 'moyenPaiement', header: 'Moyen' },
      { key: 'montant', header: 'Montant' },
      { key: 'pay', header: 'Reçu' },
      { key: 'datePaiement', header: 'Date' },
    ];
    this.isLoading = false;
  }



  construireLesParametresDeFiltre(): RechercherPaiement {

    const filtre: RechercherPaiement = {};

    const { numeroFacture, beneficiaire, moyen, type, mois, annee } = this.activeFilters;

    if (numeroFacture?.trim()) {
      filtre.numeroFacture = numeroFacture.trim();
    }

    if (beneficiaire?.trim()) {
      filtre.beneficiaire = beneficiaire.trim();
    }

    if (moyen) {
      filtre.moyen = moyen;
    }
    if (type) {
      filtre.type = type;
    }

    if (mois !== null && mois !== undefined && mois !== '') {
      filtre.mois = mois;
    }

    if (annee !== null && annee !== undefined && annee !== '') {
      filtre.annee = annee;
    }

    return filtre;
  }

  /*   construireParametreFiltre11(): any {
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
    } */

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
