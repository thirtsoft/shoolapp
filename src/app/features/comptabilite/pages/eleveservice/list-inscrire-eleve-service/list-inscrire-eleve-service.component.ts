import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { CommonService } from '../../../../../core/services/common.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-list-inscrire-eleve-service',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-inscrire-eleve-service.component.html',
  styleUrls: ['./list-inscrire-eleve-service.component.css']
})
export class ListInscrireEleveServiceComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredEleveServiceData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "eleveService";
  columns: any = [];
  eleveServiceData: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  classesList: any[] = [];
  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly commonService = inject(CommonService);


  ngOnInit(): void {
    this.chargerLesInscriptionAuxServices();
  }

  async chargerLesInscriptionAuxServices() {
    try {
      await Promise.all([
        this.getClassList(),
        this.getAnneeScolaires(),
        this.getMoisList(),
      ]);

      this.initialisationDesFiltres();
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

  getMoisList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllMois().subscribe({
        next: (data) => {
          this.moisList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
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
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: `${m.mois}`
        }))
      },
      {
        key: 'anneeScolaire',
        label: 'Année scolaire',
        type: 'select',
        options: this.anneesScolairesList.map(a => ({
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

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltre();

      apiCall = this.comptabiliteResource.fetchFilterDataTable(
        'eleveservice',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourcePaged('eleveservice', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data inscription', response);
        this.eleveServiceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'eleve', header: 'Elève' },
          { key: 'libelleClasse', header: 'Classe' },
          { key: 'anneeScolaire', header: 'Année scolaire' },
          { key: 'dateInscription', header: 'Date' },
        ];

        this.eleveServiceData = this.eleveServiceData.map((item: any) => ({
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

    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.classe) {
      filtreObj.classe = this.activeFilters.classe;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
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
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonnees(false);
  }

  getInscriptionEleveServicePaged(endpoint: string, page: number, size: number) {
    this.isLoading = true;
    this.comptabiliteResource.getResourcePaged<any>(endpoint, page, size).subscribe({
      next: (response) => {
        const data = ((response.data as unknown) as { content: any[] }).content;
        if (Array.isArray(data)) {
          this.columns = [
            { key: 'eleve', header: 'Elève' },
            { key: 'libelleClasse', header: 'Classe' },
            { key: 'anneeScolaire', header: 'Année scolaire' },
            { key: 'dateInscription', header: 'Date' },
          ];

          this.eleveServiceData = data.map((item: any) => ({
            ...item,
          }));
          console.log("Données récupérées :", this.eleveServiceData);
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
      this.filteredEleveServiceData = this.eleveServiceData.filter((item: any) =>
        Object.values(item).some((field) =>
          String(field).toLowerCase().includes(value)
        )
      );
    } else {
      this.getInscriptionEleveServicePaged('eleveservice', 0, 100);
    }
  }


}
