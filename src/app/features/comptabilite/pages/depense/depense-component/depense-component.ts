import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { TypeDepense } from '../../../../../core/models/referentiels/type-depense';
import { CommonService } from '../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-depense-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './depense-component.html',
  styleUrl: './depense-component.css',
})
export class DepenseComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDepenseData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "eleveService";
  columns: any = [];
  depenseData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  typeDepenseList: any[] = [];
  moisList: any[] = [];
  anneesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesDepenses();
  }

  async chargerLesDepenses() {
    try {
      await Promise.all([
        this.getTypeDepenses(),
        this.getMoisList(),
        this.getAnneeList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getTypeDepenses(): Promise<TypeDepense[]> {
    return new Promise((resolve, reject) => {
      this.referentielResource.getResourceList('typedepense').subscribe({
        next: (data: any) => {
          this.typeDepenseList = data;
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

  getAnneeList(): Promise<any[]> {
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
        key: 'numeroDepense',
        label: 'Numéro dépense',
        type: 'text',
        placeholder: 'Rechercher un par numéro...'
      },
      {
        key: 'typeDepense',
        label: 'Type dépense',
        type: 'select',
        options: this.typeDepenseList.map(type => ({
          value: type.id,
          label: type.libelle
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
        options: this.anneesList.map(a => ({
          value: a.id,
          label: `${a.annee}`
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.comptabiliteResource.fetchFilterDataTable(
        'depense',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourcePaged('depense', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data inscription', response);
        this.depenseData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'numeroDepense', header: 'Numéro' },
          { key: 'designation', header: 'Désignation' },
          { key: 'typeDepense', header: 'Type dépense' },
          { key: 'montantDepense', header: 'Montant' },
          { key: 'dateDepense', header: 'Date' },
        ];

        this.depenseData = this.depenseData.map((item: any) => ({
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

    if (this.activeFilters.numeroDepense) {
      filtreObj.numeroDepense = this.activeFilters.numeroDepense;
    }
    if (this.activeFilters.typeDepense) {
      filtreObj.typeDepense = this.activeFilters.typeDepense;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }

    if (this.activeFilters?.annee) {
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
