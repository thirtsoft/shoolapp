import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { CahierTexteResourceService } from '../../../services/chaier-texte-resource.service';


@Component({
  selector: 'app-liste-cahier-texte',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './liste-cahier-texte.component.html',
  styleUrls: ['./liste-cahier-texte.component.css']
})
export class ListeCahierTexteComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = false;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "chaierTexte";
  cahierTexteData: any = [];

  public readonly String = String;

  columns: any[] = [
    { key: 'numero', header: 'N°' },
    { key: 'classe', header: 'Classe' },
    { key: 'anneeScolaire', header: 'Année scolaire' },
    { key: 'etat', header: 'Etat' },
    { key: 'dateCreation', header: 'Date création' }
  ];


  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  classesList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  isSelected = false;

  apiData = {
    anneesScolaires: [],
    classes: [],
  };

  private readonly router = inject(Router);
  private readonly cahierTexteResource = inject(CahierTexteResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      const [annees, classe] = await Promise.all([
        this.getAnneeScolaires(),
        this.getClassList()
      ]);

      this.initialisationDesFiltres(annees, classe);
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

  initialisationDesFiltres(annees: any[], niveaux: any[]) {
    this.tableFilters = [
      {
        key: 'numero',
        label: 'Numéro',
        type: 'text',
        placeholder: 'Rechercher par numéro...'
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

      apiCall = this.cahierTexteResource.fetchFilterDataTable(
        'cahier-texte',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.cahierTexteResource.getResourcePaged('cahier-texte', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.cahierTexteData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.cahierTexteData = this.cahierTexteData.map((item: any) => ({
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

  buildFiltreParam(): any {
    const filtreObj: any = {};

    if (this.activeFilters.numero) {
      filtreObj.numero = this.activeFilters.numero;
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
    this.initialisationDesFiltres(this.anneesScolairesList, this.classesList);
    this.currentPage = 0;
    this.loadData(false);
  }

}