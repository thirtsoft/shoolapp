import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ReferentielResourceService } from '../../../administration/referentiel/service/referentiel-resource.service';

@Component({
  selector: 'app-liste-menu',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './liste-menu.component.html',
  styleUrls: ['./liste-menu.component.css']
})
export class ListeMenuComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataMenu: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "menu";
  columns: any = [];
  menuData: any = [];
  categoryMenuList: any[] = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesMenus();
  }

  async chargerLesMenus() {
    try {
      await Promise.all([
        this.getCategoryMenuList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getCategoryMenuList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('categorymenu').subscribe({
        next: (data) => {
          this.categoryMenuList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libellé',
        type: 'text',
        placeholder: 'Rechercher un menu'
      },
      {
        key: 'categorymenu',
        label: 'Catégorie menu',
        type: 'select',
        options: this.categoryMenuList.map(e => ({
          value: e.id,
          label: e.libelle
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

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.refentielResource.fetchFilterDataTable(
        'menu',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('menu', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.menuData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'libelle', header: 'Libellé' },
          { key: 'description', header: 'Description' },
        ];

        this.menuData = this.menuData.map((item: any) => ({
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
    if (this.activeFilters.categorymenu) {
      filtreObj.categorymenu = this.activeFilters.categorymenu;
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
