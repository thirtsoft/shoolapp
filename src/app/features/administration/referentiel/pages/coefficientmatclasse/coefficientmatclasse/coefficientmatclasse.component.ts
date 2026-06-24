import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

@Component({
  selector: 'app-coefficientmatclasse',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './coefficientmatclasse.component.html',
  styleUrls: ['./coefficientmatclasse.component.css']
})
export class CoefficientmatclasseComponent implements OnInit {

  errorMessage?: string;
  isLoading: boolean = false;
  filteredDataCoefficient: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "coeffficient";
  columns: any = [];
  coefficientData: any = [];
  isEdit: boolean = true;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  matieresList: any[] = [];
  classList: any[] = [];

  private readonly refentielResource = inject(ReferentielResourceService);

  ngOnInit(): void {
    this.chargerLesCoeffcientClasseMatiere();
  }

  async chargerLesCoeffcientClasseMatiere() {
    try {
      await Promise.all([
        this.getMatiereList(),
        this.getClasses()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMatiereList(): Promise<Matiere[]> {
    return new Promise((resolve, reject) => {
      this.refentielResource.getResourceList('matiere').subscribe({
        next: (data: any) => {
          this.matieresList = data;
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
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'matiere',
        label: 'Matiere',
        type: 'select',
        options: this.matieresList.map(m => ({
          value: m.id,
          label: m.libelle
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
        'coefficientmatiereclasse',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('coefficientmatiereclasse', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.coefficientData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'matiere', header: 'Matière' },
          { key: 'classe', header: 'Classe' },
          { key: 'coefficient', header: 'Coéfficient' },
        ];
        this.coefficientData = this.coefficientData.map((item: any) => ({
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

    if (this.activeFilters.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
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
