import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { UtilisateurResourceService } from '../../../../utilisateur/service/utilisateur-resource.service';

@Component({
  selector: 'app-parent-list',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableReferentielComponent],
  templateUrl: './parent-list.component.html',
  styleUrls: ['./parent-list.component.css']
})
export class ParentListComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataParent: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "parent";
  columns: any = [];
  parentData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly utilisateurService = inject(UtilisateurResourceService);


  ngOnInit(): void {
    this.chargerLesParents();
  }

  async chargerLesParents() {
    try {
      await Promise.all([
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher par nom/prénom'
      },
      {
        key: 'telephone',
        label: 'Téléhpone',
        type: 'text',
        placeholder: 'Rechercher par téléphone'
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

      apiCall = this.utilisateurService.fetchFilterDataTable(
        'parent',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.utilisateurService.getResourcePaged('parent', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.parentData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'matricule', header: 'Matricule' },
          { key: 'nomComplet', header: 'Nom complet' },
          { key: 'telephone', header: 'Téléphone' },
          { key: 'email', header: 'Email' },
          { key: 'profession', header: 'Profession' },
          { key: 'username', header: 'Nom utilisateur' },

        ];
        this.parentData = this.parentData?.map((item: any) => ({
          ...item,
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.telephone) {
      filtreObj.telephone = this.activeFilters.telephone;
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