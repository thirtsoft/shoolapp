import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-livres',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './livres.component.html',
  styleUrls: ['./livres.component.css']
})
export class LivresComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataLivre: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "livre";
  columns: any = [];
  livreData: any = [];
  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  classeList: any[] = [];
  matiereList: any[] = [];

  typeLivresOptions: string[] = [
    "Arithmetique",
    "Dessin",
    'Ecriture',
    "Lecture",
    "Loisir",
    'Orale',
    'Autres'
  ];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);

  ngOnInit(): void {
    this.getLivresPaged('livre', 0, 100);
    this.chargerLesLivres();
  }

  async chargerLesLivres() {
    try {
      await Promise.all([
        this.getClassList(),
        this.getMatiereList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getClassList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllClasses().subscribe({
        next: (data) => {
          this.classeList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getMatiereList(): Promise<ListeClasse[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllMatieres().subscribe({
        next: (data) => {
          this.matiereList = data;
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
        label: 'Titre livre',
        type: 'text',
        placeholder: 'Rechercher un livre...'
      },
      {
        key: 'classe',
        label: 'Classe',
        type: 'select',
        options: this.classeList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
      },
      {
        key: 'matiere',
        label: 'Matière',
        type: 'select',
        options: this.matiereList.map(a => ({
          value: a.id,
          label: `${a.libelle}`
        }))
      },

      {
        key: 'type',
        label: 'Type livre',
        type: 'select',
        options: this.typeLivresOptions.map(s => ({
          value: s,
          label: s
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

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.buildFiltreParam();

      apiCall = this.planificationResource.fetchFilterDataTable(
        'livre',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('livre', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.livreData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Titre' },
          { key: 'isbn', header: 'Isbn' },
          { key: 'classe', header: 'Classe' },
          { key: 'matiere', header: 'Matiere' },
          { key: 'type', header: 'Type' },
          { key: 'description', header: 'Description' },
        ];
        this.livreData = this.livreData.map((item: any) => ({
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

    if (this.activeFilters.titre) {
      filtreObj.titre = this.activeFilters.titre;
    }

    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters?.matiere) {
      filtreObj.matiere = this.activeFilters.matiere;
    }
    if (this.activeFilters.type) {
      filtreObj.type = this.activeFilters.type;
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

  getLivresPaged(endpoint: string, page: number, size: number) {
    this.isLoading = true;
    this.planificationResource.getResourcePaged<any>(endpoint, page, size).subscribe({
      next: (response) => {
        const data = ((response.data as unknown) as { content: any[] }).content;
        if (Array.isArray(data)) {
          this.columns = [
            { key: 'titre', header: 'Titre' },
            { key: 'isbn', header: 'Isbn' },
            { key: 'classe', header: 'Classe' },
            { key: 'matiere', header: 'Matiere' },
            { key: 'type', header: 'Type' },
            { key: 'description', header: 'Description' },
          ];
          this.livreData = data.map((item: any) => ({
            ...item,
          }));
          console.log("Données récupérées :", this.livreData);
        } else {
          console.error("Les données ne contiennent pas un tableau 'content'", response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des données :", error);
        this.isLoading = false;
      },
    });
  }

  handleFilterChange(filterValue: string) {
    const value = filterValue.trim().toLowerCase();
    if (value) {
      this.filteredDataLivre = this.livreData.filter((item: any) =>
        Object.values(item).some((field) =>
          String(field).toLowerCase().includes(value)
        )
      );
    } else {
      this.getLivresPaged('livre', 0, 100);
    }
  }


}
