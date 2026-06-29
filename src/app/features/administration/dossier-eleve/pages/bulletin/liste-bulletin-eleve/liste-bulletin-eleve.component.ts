import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';


@Component({
  selector: 'app-liste-bulletin-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './liste-bulletin-eleve.component.html',
  styleUrls: ['./liste-bulletin-eleve.component.css']
})
export class ListeBulletinEleveComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = false;
  isLoading: boolean = false;
  filteredBulletinData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "bulletin";
  columns: any = [];
  bulletinData: any = [];
  isGeneratedBulletin: boolean = true;

  readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  semestreList: any[] = [];
  classeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly dossierEleveService = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.chargerLesBulletins();
  }

  async chargerLesBulletins() {
    try {
      const [classe, semestre, annees]: any = await Promise.all([
        this.getClasseList(),
        this.getSemestreList(),
        this.getAnneeScolaires(),

      ]);
      this.initialisationDesFiltres(classe, semestre, annees);
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }


  getClasseList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data: any) => {
          this.classeList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getAnneeScolaires(): Promise<AnneeScolaire[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllAnneeScolaires().subscribe({
        next: (data: any) => {
          this.anneesScolairesList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSemestres().subscribe({
        next: (data: any) => {
          this.semestreList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let resultatAPI;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametreDeFiltre();

      resultatAPI = this.dossierEleveService.fetchFilterDataTable(
        'bulletin',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      resultatAPI = this.dossierEleveService.getResourcePaged('bulletin', this.currentPage, this.pageSize);
    }
    resultatAPI.subscribe({
      next: (response) => {
        this.bulletinData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'eleve', header: 'Elève' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'appreciation_general', header: 'Appreciation' },
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

  initialisationDesFiltres(classes: any[], semestre: any[], annees: any[]) {
    this.tableFilters = [
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: classes.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }

    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }

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
    this.initialisationDesFiltres(this.classeList, this.semestreList, this.anneesScolairesList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

}
