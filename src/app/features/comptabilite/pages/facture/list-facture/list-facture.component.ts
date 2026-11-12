import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { ListEtatResponse } from '../../../../../core/models/base/list-etat-response';
import { RechercherFacture } from '../../../../../core/models/comptabilite/rechercher-facture';
import { DataResult } from '../../../../../core/datamodel/data-model';

@Component({
  selector: 'app-list-facture',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-facture.component.html',
  styleUrls: ['./list-facture.component.css']
})
export class ListFactureComponent implements OnInit {

  isEdit: boolean = false;
  isLoading: boolean = false;
  filteredFactureData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "facture";
  columns: any = [];
  factureData: any = [];
  isGeneratedFacture: boolean = true;

  isView: boolean = true;
  isViewPopup: boolean = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  etatfactureOptions: ListEtatResponse[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: Partial<RechercherFacture> = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesFactures();

  }

  async chargerLesFactures() {
    try {
      await Promise.all([
        this.getEtatsFactureList(),
        this.getMoisList(),
        this.getAnneesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getEtatsFactureList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getEtatsFactures().subscribe({
        next: (data) => {
          this.etatfactureOptions = data;
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
          console.log('annees facture', this.anneeList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }


  initialisationDesFiltres(): void {

    this.tableFilters = [

      {
        key: 'numeroFacture',
        label: 'N° facture',
        type: 'text',
        placeholder: 'Rechercher une facture...'
      },

      {
        key: 'nomPrenom',
        label: 'Élève',
        type: 'text',
        placeholder: 'Nom ou prénom...'
      },

      {
        key: 'etat',
        label: 'État',
        type: 'select',
        options: this.etatfactureOptions.map(e => ({
          value: e.etatUuid,
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
      }

    ];
  }

  onFilterChange(filter: IFilterConfig, value: any): void {

    this.activeFilters[filter.key as keyof RechercherFacture] = value;

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

      this.comptabiliteResource.filteredFilterDataTable<any, RechercherFacture>(
        'facture', this.currentPage, this.pageSize, filtreParam
      )
        .subscribe({
          next: (response) => {
            this.traiterReponseFactures(response);
          },
          error: (error) => {
            console.error('Erreur chargement factures filtrées:', error);
            this.isLoading = false;
          }
        });

    } else {

      this.comptabiliteResource.getResourcePaged<any>('facture', this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.traiterReponseFactures(response);
          },
          error: (error) => {
            console.error('Erreur chargement factures:', error);
            this.isLoading = false;
          }
        });
    }
  }

  private traiterReponseFactures(response: DataResult<any>): void {

    this.factureData = response.data?.content ?? [];
    this.totalElements = response.data?.totalElements ?? 0;

    this.columns = [
      { key: 'numeroFacture', header: 'N° facture' },
      { key: 'nomCompletEleve', header: 'Élève' },
      { key: 'montant', header: 'Montant' },
      { key: 'etat', header: 'État' },
      { key: 'dateFacture', header: 'Date' }
    ];

    this.isLoading = false;
  }

  construireLesParametresDeFiltre(): RechercherFacture {

    const filtre: RechercherFacture = {};

    const { numeroFacture, nomPrenom, etat, mois, annee } = this.activeFilters;

    if (numeroFacture?.trim()) {
      filtre.numeroFacture = numeroFacture.trim();
    }

    if (nomPrenom?.trim()) {
      filtre.nomPrenom = nomPrenom.trim();
    }

    if (etat) {
      filtre.etat = etat;
    }

    if (mois !== null && mois !== undefined && mois !== '') {
      filtre.mois = mois;
    }

    if (annee !== null && annee !== undefined && annee !== '') {
      filtre.annee = annee;
    }

    return filtre;
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

  resetFilters(): void {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }


}
