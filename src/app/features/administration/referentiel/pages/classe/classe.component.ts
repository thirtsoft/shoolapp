import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { Classe } from '../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../core/models/referentiels/niveau';
import { ReferentielResourceService } from '../../service/referentiel-resource.service';
import { ReferentielService } from '../../service/referentiel.service';

@Component({
  selector: 'app-classe',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './classe.component.html',
  styleUrls: ['./classe.component.css']
})
export class ClasseComponent implements OnInit {
  errorMessage?: string;
  classes: Classe[] = [];
  classeId?: number;

  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataAnneeClasse: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "classe";
  columns: any = [];
  classeData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  niveauList: any[] = [];

  private readonly refentielResource = inject(ReferentielResourceService);
  private readonly referentielService = inject(ReferentielService);


  ngOnInit(): void {
    this.chargerLesClasses();
  }

  async chargerLesClasses() {
    try {
      await Promise.all([
        this.getNiveauList(),
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getNiveauList(): Promise<Niveau[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllNiveau().subscribe({
        next: (data) => {
          this.niveauList = data;
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
      },
      {
        key: 'niveau',
        label: 'Niveau',
        type: 'select',
        options: this.niveauList.map(n => ({
          value: n.id,
          label: n.libelle
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
        'classe',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResource.getResourcePaged('classe', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.classeData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'niveau', header: 'Niveau' },
          { key: 'libelle', header: 'Libellé' },
        ];

        this.classeData = this.classeData.map((item: any) => ({
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
    if (this.activeFilters.niveau) {
      filtreObj.niveau = this.activeFilters.niveau;
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
