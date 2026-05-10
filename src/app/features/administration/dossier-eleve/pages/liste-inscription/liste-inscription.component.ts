import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../core/models/referentiels/niveau';
import { ReferentielService } from '../../../referentiel/service/referentiel.service';
import { DossierResourceService } from '../../service/dossier-resource.service';


@Component({
  selector: 'app-liste-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './liste-inscription.component.html',
  styleUrls: ['./liste-inscription.component.css']
})
export class ListeInscriptionComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = false;
  isLoading: boolean = false;
  filteredFactureData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "inscription";
  inscriptionData: any = [];

  public readonly String = String;

  columns: any[] = [
    { key: 'code', header: 'Code' },
    { key: 'nomCompletEleve', header: 'Elève' },
    { key: 'anneeScolare', header: 'Année scolaire' },
    { key: 'classe', header: 'Classe' },
    { key: 'montantInscription', header: 'Montant' },
    { key: 'sexeEleve', header: 'Sexe' },
    { key: 'dateInscription', header: 'Date' }
  ];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  classesList: any[] = [];
  niveauList: any[] = [];
  sexesOptions: string[] = ['Masculin', 'Féminin'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  apiData = {
    anneesScolaires: [],
    classes: [],
    niveaux: []
  };

  private readonly router = inject(Router);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      const [annees, niveaux] = await Promise.all([
        this.getAnneeScolaires(),
        this.getNiveauList(),
        this.getClassList()
      ]);

      this.initialisationDesFiltres(annees, niveaux);
      this.loadData(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
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

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data: any) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getNiveauList(): Promise<Niveau[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllNiveau().subscribe({
        next: (data: any) => {
          this.niveauList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }


  initialisationDesFiltres(annees: any[], niveaux: any[]) {
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
        options: this.classesList.map(c => ({
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
      {
        key: 'niveau',
        label: 'Niveau',
        type: 'select',
        options: niveaux.map(n => ({
          value: n.id,
          label: n.libelle
        })),
        onChange: (value) => this.onNiveauChange(value)
      },

      {
        key: 'sexe',
        label: 'Sexe',
        type: 'select',
        options: this.sexesOptions.map(s => ({
          value: s,
          label: s
        }))
      },
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    if (filter.key === 'niveauId') {
    }
    this.hasActiveFilters = Object.values(this.activeFilters).some(val =>
      val !== null && val !== undefined && val !== ''
    );
    this.currentPage = 0;
    this.loadData(this.hasActiveFilters);
  }

  loadData(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.buildFiltreParam();

      apiCall = this.dossierResource.fetchFilterDataTable(
        'inscription',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.dossierResource.getResourcePaged('inscription', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data inscription', response);
        this.inscriptionData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.inscriptionData = this.inscriptionData.map((item: any) => ({
          ...item,
          dateInscription: this.formatDate(item.dateInscription),
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  buildFiltreParam(): any {
    const filtreObj: any = {};

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.niveau) {
      filtreObj.niveau = this.activeFilters.niveau;
    }
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters?.anneeScolaire) {
      filtreObj.anneeScolaire = this.activeFilters.anneeScolaire;
    }
    if (this.activeFilters.sexe) {
      filtreObj.sexe = this.activeFilters.sexe;
    }
    if (this.activeFilters.dateFrom || this.activeFilters.dateTo) {
      filtreObj.dateInscription = {
        from: this.activeFilters.dateFrom,
        to: this.activeFilters.dateTo
      };
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;

  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.loadData(this.hasActiveFilters);
    }
  }


  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.loadData(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres(this.anneesScolairesList, this.niveauList);
    this.currentPage = 0;
    this.loadData(false);
  }
  onNiveauChange(niveauId: string) { }

  /*
  onNiveauChange(niveauId: string) {
    const classeFilter = this.tableFilters.find(f => f.key === 'classe');
    if (classeFilter) {
      classeFilter.options = this.apiData.classes
        .filter(c => c.niveauId === niveauId)
        .map(c => ({ value: c.id, label: c.libelle }));
      classeFilter.disabled = false;
    }
  }*/

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

}