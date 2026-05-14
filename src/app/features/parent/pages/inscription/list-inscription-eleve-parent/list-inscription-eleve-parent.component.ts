import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../core/models/referentiels/niveau';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';

@Component({
  selector: 'app-list-inscription-eleve-parent',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-inscription-eleve-parent.component.html',
  styleUrls: ['./list-inscription-eleve-parent.component.css']
})
export class ListInscriptionEleveParentComponent implements OnInit {
  isLoading: boolean = false;
  filteredFactureData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  inscriptionData: any = [];
  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  columns: any[] = [
    { key: 'code', header: 'Code' },
    { key: 'anneeScolare', header: 'Année scolaire' },
    { key: 'classe', header: 'Classe' },
    { key: 'montantInscription', header: 'Montant' },
    { key: 'dateInscription', header: 'Date' }
  ];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  classesList: any[] = [];
  niveauList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  apiData = {
    anneesScolaires: [],
    classes: [],
    niveaux: []
  };

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.chargerLesInscriptionEleve();
  }

  async chargerLesInscriptionEleve() {
    try {
      const [annees, niveaux] = await Promise.all([
        this.getAnneeScolaires(),
        this.getNiveauList(),
        this.getClassList()
      ]);

      this.initialisationDesFiltres(annees, niveaux);
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

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data) => {
          this.classesList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
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

  initialisationDesFiltres(annees: any[], niveaux: any[]) {
    this.tableFilters = [
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

      const filtreParam = this.buildFiltreParam();

      console.log('Param envoyé {} ', filtreParam);

      apiCall = this.dossierResource.fetchFilterByElementDataTable(
        'inscription/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.dossierResource.getResourcesByIdPaged('inscription/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Inscription', response);
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
    if (this.activeFilters.niveau) {
      filtreObj.niveau = this.activeFilters.niveau;
    }
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
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
    this.initialisationDesFiltres(this.anneesScolairesList, this.niveauList);
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  onNiveauChange(niveauId: string) {
    const classeFilter = this.tableFilters.find(f => f.key === 'classe');
    if (classeFilter) {
      classeFilter.options = this.apiData.classes
        .filter((c: any) => c.niveauId === niveauId)
        .map((c: any) => ({ value: c.id, label: c.libelle }));
      classeFilter.disabled = false;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }
}