import { Component, inject, OnInit } from '@angular/core';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';

@Component({
  selector: 'app-emploie-du-temps',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './emploie-du-temps.component.html',
  styleUrls: ['./emploie-du-temps.component.css']
})
export class EmploieDuTempsComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEmploie: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "emploiedutemps";
  columns: any = [];
  emploidutempsData: any = [];
  readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  anneeScolaireList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.chargerLesEmploiDuTemps();
  }


  async chargerLesEmploiDuTemps() {
    try {
      await Promise.all([
        this.getAnneeScolaireList(),
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getAnneeScolaireList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllAnneeScolaires().subscribe({
        next: (data) => {
          this.anneeScolaireList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'titre',
        label: 'Titre',
        type: 'text',
        placeholder: 'Rechercher par titre ....'
      },
      {
        key: 'anneeScolaire',
        label: 'Année scolaire',
        type: 'select',
        options: this.anneeScolaireList.map(a => ({
          value: a.id,
          label: a.libelle
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

      const filtreParam = this.construireParametreFiltre();

      apiCall = this.planificationResource.fetchFilterDataTable(
        'planification/emploidutemps',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('planification/emploidutemps', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.emploidutempsData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'libelleAnneeScolaire', header: 'Année scolaire' },
          { key: 'libelleSemaine', header: 'Semaine' },
          { key: 'createdDate', header: 'Date création' },
        ];
        this.emploidutempsData = this.emploidutempsData.map((item: any) => ({
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

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.titre) {
      filtreObj.titre = this.activeFilters.titre;
    }

    if (this.activeFilters.anneeScolaire) {
      filtreObj.anneeScolaire = this.activeFilters.anneeScolaire;
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
