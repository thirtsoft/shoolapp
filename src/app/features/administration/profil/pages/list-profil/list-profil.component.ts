import { Component, inject, OnInit } from '@angular/core';
import { ProfilageService } from '../../service/profilage.service';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { Action } from '../../../../../core/models/profil/action';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { UtilisateurResourceService } from '../../../utilisateur/service/utilisateur-resource.service';

@Component({
  selector: 'app-list-profil',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-profil.component.html',
  styleUrls: ['./list-profil.component.css']
})
export class ListProfilComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataProfile: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "profile";
  columns: any = [];
  profileData: any = [];
  listActions: Action[] = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly utilisateurService = inject(UtilisateurResourceService);
  private readonly profileService = inject(ProfilageService);

  constructor(

  ) { }

  ngOnInit(): void {
    this.chargerLesProfils();
  }

  async chargerLesProfils() {
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
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un profil'
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
        'profilage/profile',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.utilisateurService.getResourcePaged('profilage/profile', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.profileData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'libelle', header: 'Libellé' },
        ];
        this.profileData = this.profileData?.map((item: any) => ({
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
