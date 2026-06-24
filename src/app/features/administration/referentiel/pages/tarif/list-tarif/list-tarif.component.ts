import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { TypeServiceOffert } from '../../../../../../core/models/referentiels/type-service-offert';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-list-tarif',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-tarif.component.html',
  styleUrls: ['./list-tarif.component.css']
})
export class ListTarifComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredTarifData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "tarif";
  columns: any = [];
  tarifData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  typeServiceList: any[] = [];
  classList: any[] = [];

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesTarifs();
  }

  async chargerLesTarifs() {
    try {
      await Promise.all([
        this.getTypeServiceList(),
        this.getClasses()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getTypeServiceList(): Promise<TypeServiceOffert[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('typeserviceoffert').subscribe({
        next: (data: any) => {
          this.typeServiceList = data;
          console.log('type service', this.typeServiceList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getClasses(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('classe').subscribe({
        next: (data: any) => {
          this.classList = data;
          console.log('classList', this.classList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'typeService',
        label: 'Type service offert',
        type: 'select',
        options: this.typeServiceList.map(s => ({
          value: s.id,
          label: s.libelle
        })),
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classList.map(c => ({
          value: c.id,
          label: c.libelle
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

      apiCall = this.refentielResource.fetchFilterDataTable(
        'tarif',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('tarif', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.tarifData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'typeService', header: 'Type service' },
          { key: 'classe', header: 'Classe' },
          { key: 'montant', header: 'Montant' },
          { key: 'anneeScolaire', header: 'Annee scolaire' }
        ];
        this.tarifData = this.tarifData.map((item: any) => ({
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

    if (this.activeFilters.typeService) {
      filtreObj.typeService = this.activeFilters.typeService;
    }
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
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
