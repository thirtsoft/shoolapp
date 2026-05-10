import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { UtilisateurResourceService } from '../../../service/utilisateur-resource.service';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';

@Component({
  selector: 'app-list-enseignant',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-enseignant.component.html',
  styleUrls: ['./list-enseignant.component.css']
})
export class ListEnseignantComponent implements OnInit {

  errorMessage?: string;
  today = new Date();
  eleveId?: number | null;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEnseignant: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "enseignant";
  columns: any = [];
  enseignantData: any = [];
  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  niveauEducationList: any[] = [];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly enseignantService = inject(UtilisateurResourceService);
  // private readonly referentielService = inject(ReferentielService);


  ngOnInit(): void {
    this.chargerLesEnseignants();
  }

  async chargerLesEnseignants() {
    try {
      await Promise.all([
        //      this.getNiveauEducationList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  /*
  getNiveauEducationList(): Promise<NiveauEducation[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllNiveauEducations().subscribe({
        next: (data) => {
          this.niveauEducationList = data;
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
        placeholder: 'Rechercher par nom/prénom...'
      },
      {
        key: 'telephone',
        label: 'Téléhpone',
        type: 'text',
        placeholder: 'Rechercher par téléphone...'
      },
      {
        key: 'niveauEducation',
        label: 'Niveau éducation',
        type: 'select',
        options: this.niveauEducationList.map(n => ({
          value: n.id,
          label: n.libelle
        })),
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

      apiCall = this.enseignantService.fetchFilterDataTable(
        'enseignant',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.enseignantService.getResourcePaged('enseignant', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.enseignantData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'nomComplet', header: 'Nom complet' },
          { key: 'niveauEducation', header: 'Education' },
          { key: 'address', header: 'Addresse' },
          { key: 'telephone', header: 'Téléphone' },
          { key: 'email', header: 'Email' },
          { key: 'username', header: 'Nom utilisateur' },

        ];
        this.enseignantData = this.enseignantData?.map((item: any) => ({
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
    if (this.activeFilters.niveauEducation) {
      filtreObj.niveauEducation = this.activeFilters.niveauEducation;
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
