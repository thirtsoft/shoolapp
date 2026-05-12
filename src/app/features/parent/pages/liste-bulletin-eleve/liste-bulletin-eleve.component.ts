import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { DossierResourceService } from '../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielService } from '../../../administration/referentiel/service/referentiel.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { AnneeScolaire } from '../../../../core/models/referentiels/annee-scolaire';
import { Semestre } from '../../../../core/models/referentiels/semestre';

@Component({
  selector: 'app-liste-bulletin-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './liste-bulletin-eleve.component.html',
  styleUrls: ['./liste-bulletin-eleve.component.css']
})
export class ListeBulletinEleveComponent implements OnInit {

  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  bulletinData: any = [];

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  semestreList: any[] = [];
  classeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly dossierEleveService = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesBulletinsEleve();
  }

  async chargerLesBulletinsEleve() {
    try {
      const [semestre, annees] = await Promise.all([
        this.getSemestreList(),
        this.getAnneeScolaires(),

      ]);
      this.initialisationDesFiltres(semestre, annees);
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }
  getAnneeScolaires(): Promise<AnneeScolaire[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllAnneeScolaires().subscribe({
        next: (data) => {
          this.anneesScolairesList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSemestres().subscribe({
        next: (data) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let resultatAPI;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametreDeFiltre();

      resultatAPI = this.dossierEleveService.fetchFilterByElementDataTable(
        'bulletin/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      resultatAPI = this.dossierEleveService.getResourcesByIdPaged('bulletin/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    resultatAPI.subscribe({
      next: (response) => {
        this.bulletinData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'semestre', header: 'Semestre' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'appreciation_general', header: 'Appreciation générale' },
          { key: 'bulletin', header: 'Bulletin' },
          { key: 'dateCreation', header: 'Date' },
        ];

        this.bulletinData = this.bulletinData.map((item: any) => ({
          ...item,
          bulletin: '',
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  initialisationDesFiltres(semestre: any[], annees: any[]) {
    this.tableFilters = [
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: semestre.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },

      {
        key: 'anneeScolaire',
        label: 'Année scolaire',
        type: 'select',
        options: annees.map(a => ({
          value: a.id,
          label: `${a.libelle}`
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

  construireLesParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }

    if (this.activeFilters?.anneeScolaire) {
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
    this.initialisationDesFiltres(this.semestreList, this.anneesScolairesList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }


}