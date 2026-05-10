import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilisateurResourceService } from '../../../service/utilisateur-resource.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { Profil } from '../../../../../../core/models/profil/profil';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';

@Component({
  selector: 'app-liste-ecole',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, GenericTableReferentielComponent],
  templateUrl: './liste-ecole.component.html',
  styleUrls: ['./liste-ecole.component.css']
})
export class ListeEcoleComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  eleveId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEcole: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "ecole";
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

  private readonly router = inject(Router);
  private readonly utilisateurService = inject(UtilisateurResourceService);
  //  private readonly localStorage = inject(ProfilageService);
  private readonly ngbModelService = inject(NgbModal);

  ngOnInit(): void {
    this.chargerLesEcoles();
  }

  async chargerLesEcoles() {
    try {
      await Promise.all([
  //      this.getProfileListt()
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
        next: (data:any) => {
          this.profilList = data;
          resolve(data);
        },
        error: (err:any) => reject(err)
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
        'ecole',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.utilisateurService.getResourcePaged('ecole', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.utilisateurData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'code', header: 'Code' },
          { key: 'nom', header: 'Nom école' },
          { key: 'prenomAdminEcole', header: 'Prénom' },
          { key: 'nomAdminEcole', header: 'Nom' },
          { key: 'telephone', header: 'Téléphone' },
          { key: 'email', header: 'Email' },
          { key: 'usernameAdminEcole', header: 'Nom utilisateur' },
          { key: 'createdAt', header: 'Date' },

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
