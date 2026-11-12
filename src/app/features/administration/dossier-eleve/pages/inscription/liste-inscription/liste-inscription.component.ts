import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';

import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Niveau } from '../../../../../../core/models/referentiels/niveau';

import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';
import { RechercherInscription } from '../../../../../../core/models/dossiereleve/inscription/rechercher-inscription';

@Component({
  selector: 'app-liste-inscription',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericTableDossierComponent
  ],
  templateUrl: './liste-inscription.component.html',
  styleUrls: ['./liste-inscription.component.css']
})
export class ListeInscriptionComponent implements OnInit {

  errorMessage?: string;
  isEdit = false;
  isLoading = false;

  filteredFactureData: any;
  isLockable = true;
  isTable = true;

  deleteEndpoint = 'inscription';

  inscriptionData: any[] = [];

  public readonly String = String;

  columns: any[] = [
    { key: 'code', header: 'Code' },
    { key: 'nomCompletEleve', header: 'Elève' },
    { key: 'sexeEleve', header: 'Sexe' },
    { key: 'anneeScolare', header: 'Année scolaire' },
    { key: 'classe', header: 'Classe' },
    { key: 'montantInscription', header: 'Montant' },
    { key: 'recu', header: 'Reçu' },
    { key: 'dateInscription', header: 'Date' }
  ];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  tableSizes = [10, 20, 50, 100];

  anneesScolairesList: AnneeScolaire[] = [];
  classesList: ListeClasse[] = [];
  niveauList: Niveau[] = [];

  sexesOptions: string[] = ['Masculin', 'Féminin'];

  tableFilters: IFilterConfig[] = [];

  activeFilters: Partial<RechercherInscription> = {};

  hasActiveFilters = false;

  isSelected = false;

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    try {
      const [annees, niveaux, classes] = await Promise.all([
        this.getAnneeScolaires(),
        this.getNiveauList(),
        this.getClassList()
      ]);

      this.initialisationDesFiltres(annees, niveaux, classes);

      this.loadData(false);

    } catch (error) {
      console.error(
        'Erreur chargement données:',
        error
      );
    }
  }

  getAnneeScolaires(): Promise<AnneeScolaire[]> {
    return new Promise((resolve, reject) => {
      this.referentielService
        .getAllAnneeScolaires()
        .subscribe({
          next: (data: AnneeScolaire[]) => {
            this.anneesScolairesList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService
        .getAllClasses()
        .subscribe({
          next: (data: ListeClasse[]) => {
            this.classesList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  getNiveauList(): Promise<Niveau[]> {
    return new Promise((resolve, reject) => {
      this.referentielService
        .getAllNiveau()
        .subscribe({
          next: (data: Niveau[]) => {
            this.niveauList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
    });
  }

  initialisationDesFiltres(annees: AnneeScolaire[], niveaux: Niveau[], classes: ListeClasse[]): void {

    this.tableFilters = [

      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },

      {
        key: 'niveau',
        label: 'Niveau',
        type: 'select',
        options: niveaux.map(n => ({
          value: n.id ?? '',
          label: n.libelle ?? ''
        })),
        onChange: (value) => this.onNiveauChange(value)
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: classes.map(c => ({
          value: c.id ?? '',
          label: c.libelle ?? ''
        }))
      },

      {
        key: 'anneeScolaire',
        label: 'Année scolaire',
        type: 'select',
        options: annees.map(a => ({
          value: a.id ?? '',
          label: a.libelle ?? ''
        }))
      },

      {
        key: 'sexe',
        label: 'Sexe',
        type: 'select',
        options: this.sexesOptions.map(sexe => ({
          value: sexe,
          label: sexe
        }))
      }

    ];
  }

  onFilterChange(filter: IFilterConfig, value: any): void {
    this.activeFilters = { ...this.activeFilters, [filter.key]: value };

    this.hasActiveFilters = Object.values(this.activeFilters).some(
      val =>
        val !== null &&
        val !== undefined &&
        val !== ''
    );

    this.currentPage = 0;

    this.loadData(this.hasActiveFilters);
  }

  loadData(useFilterApi: boolean): void {

    this.isLoading = true;

    let apiCall;

    if (useFilterApi) {

      const filtre = this.buildFiltreParam();

      apiCall = this.dossierResource.filteredFilterDataTable<any, RechercherInscription>(
        'inscription', this.currentPage, this.pageSize, filtre
      );

    } else {

      apiCall = this.dossierResource.getResourcePaged<any>('inscription', this.currentPage, this.pageSize);
    }

    apiCall.subscribe({

      next: (response) => {

        this.inscriptionData = response.data?.content ?? [];
        this.totalElements = response.data?.totalElements ?? 0;

        this.inscriptionData = this.inscriptionData.map((item: any) => ({
          ...item,
          dateInscription: this.formatDate(item.dateInscription),
          recu: ''
        })
        );

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Erreur chargement inscriptions:', error);
        this.isLoading = false;
      }

    });
  }

  buildFiltreParam(): RechercherInscription {
    const filtre: RechercherInscription = {};
    const { nomPrenom, niveau, classe, anneeScolaire, sexe, mois, annee } = this.activeFilters;

    if (nomPrenom) {
      filtre.nomPrenom = nomPrenom.trim();
    }

    if (niveau) {
      filtre.niveau = Number(niveau);
    }

    if (classe) {
      filtre.classe = Number(classe);
    }

    if (anneeScolaire) {
      filtre.anneeScolaire = Number(anneeScolaire);
    }

    if (sexe) {
      filtre.sexe = sexe;
    }

    if (mois) {
      filtre.mois = Number(mois);
    }

    if (annee) {
      filtre.annee = Number(annee);
    }

    return filtre;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number): void {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.loadData(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string): void {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.loadData(this.hasActiveFilters);
    }
  }

  resetFilters(): void {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres(this.anneesScolairesList, this.niveauList, this.classesList);
    this.currentPage = 0;
    this.loadData(false);
  }

  onNiveauChange(niveauId: string): void {
    // À compléter uniquement si
    // on veut filtrer dynamiquement
    // les classes selon le niveau.
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return '';
    }
    return dateString.split('T')[0];
  }
}