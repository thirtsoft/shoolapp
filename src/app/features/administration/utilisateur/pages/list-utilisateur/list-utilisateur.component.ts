import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { UtilisateurResourceService } from '../../service/utilisateur-resource.service';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';

@Component({
  selector: 'app-list-utilisateur',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-utilisateur.component.html',
  styleUrls: ['./list-utilisateur.component.css']
})
export class ListUtilisateurComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  eleveId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataUtilisateur: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "utilisateur";
  columns: any = [];
  utilisateurData: any = [];
  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  profilList: any[] = [];

  private readonly utilisateurService = inject(UtilisateurResourceService);
  //  private readonly profileService = inject(ProfilageService);
  //  private readonly localStorage = inject(LocalStorageService);
  private readonly modalService = inject(NgbModal);
  private readonly ngbModelService = inject(NgbModal);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.chargerLesUtilisateurs();
  }

  async chargerLesUtilisateurs() {
    try {
      await Promise.all([
        //     this.getProfileListt()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  /*
  getProfileListt(): Promise<Profil[]> {
    return new Promise((resolve, reject) => {
      this.profileService.getProfilesAgents().subscribe({
        next: (data) => {
          this.profilList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }*/

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un nom/prénom...'
      },
      {
        key: 'telephone',
        label: 'Téléphone',
        type: 'text',
        placeholder: 'Rechercher par téléphone...'
      },
      {
        key: 'profile',
        label: 'Profile',
        type: 'select',
        options: this.profilList.map(p => ({
          value: p.id,
          label: p.libelle
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

      apiCall = this.utilisateurService.fetchFilterDataTable(
        'utilisateur',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.utilisateurService.getResourcePaged('utilisateur', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.utilisateurData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'civility', header: 'Civilité' },
          { key: 'nomComplet', header: 'Nom complet' },
          { key: 'adress', header: 'Adresse' },
          { key: 'telephone', header: 'Téléphone' },
          { key: 'email', header: 'Email' },
          { key: 'profil', header: 'Profile' },
          { key: 'username', header: 'Nom utilisateur' },

        ];
        this.utilisateurData = this.utilisateurData?.map((item: any) => ({
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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.telephone) {
      filtreObj.telephone = this.activeFilters.telephone;
    }
    if (this.activeFilters.profile) {
      filtreObj.profile = this.activeFilters.profile;
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