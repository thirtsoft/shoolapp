import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignementContextService, GestionClasseContext } from '../../../service/enseignement-contexte.service';

@Component({
  selector: 'app-list-exercice',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-exercice.component.html',
  styleUrls: ['./list-exercice.component.css']
})
export class ListExerciceComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;

  filteredDataExercice: any;
  isLockable: boolean = true;
  isTable: boolean = true;

  deleteEndpoint = 'exercice';
  columns: any = [];
  exerciceData: any = [];


  public readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  tableSizes = [10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  classeId: number;

  contexteClasse = signal<GestionClasseContext | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly commonService = inject(CommonService);
  private readonly enseignementContextService = inject(EnseignementContextService);
  private readonly dossierResource = inject(DossierResourceService);

  constructor() {
    this.classeId = Number(this.activeRoute.snapshot.params['id']);
    console.log('ClassID', this.classeId);

    const contexte = this.enseignementContextService.getGestionClasseContext();

    console.log('contexteClasse', contexte?.classe);
    console.log('contexteMatiere', contexte?.matiere);

    console.log('contexteAnneeScolaire', contexte?.anneeScolaire);

    console.log('contexteCours', contexte?.courseId);


    if (contexte) {
      this.contexteClasse.set(contexte);
      console.log('Contexte chargé :', this.contexteClasse());
    }
  }

  ngOnInit(): void {
    void this.chargerLesExercices();
  }

  async chargerLesExercices() {
    try {

      await Promise.all([this.getMoisList(),]);
      this.initialisationDesFiltresExercice();
      this.chargerLesDonneesExercices(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  canEditOrDeleteEvaluation(item: any): boolean {
    return item.etat !== 'Validée';
  }

  getMoisList(): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {

        this.commonService.getAllMois().subscribe({

          next: (data) => {
            this.moisList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
      }
    );
  }

  initialisationDesFiltresExercice() {
    this.tableFilters = [
      {
        key: 'titre',
        label: 'Titre exercice',
        type: 'text',
        placeholder: 'Rechercher un exercie...'
      },

      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(
          m => ({
            value: m.id,
            label: `${m.mois}`
          })
        )
      }

    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(
      val =>
        val !== null &&
        val !== undefined &&
        val !== ''
    );

    this.currentPage = 0;
    this.chargerLesDonneesExercices(this.hasActiveFilters);
  }

  chargerLesDonneesExercices(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {
      const filtreParam = this.construireParametreFiltre();
      apiCall = this.planification.fetchFilterDataTable(
        'planification/enseignant/exercice/me',
        this.currentPage,
        this.pageSize,
        filtreParam
      );

    } else {

      apiCall = this.planification.getResourceByIdPaged(
        'planification/enseignant/exercice/me',
        Number(this.classeId),
        this.currentPage,
        this.pageSize
      );
    }
    apiCall.subscribe({
      next: (response) => {
        this.exerciceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [

          {
            key: 'numeroExercice',
            header: 'N°'
          },

          {
            key: 'titre',
            header: 'Titre'
          },

          {
            key: 'livre',
            header: 'Livre'
          },

          {
            key: 'page',
            header: 'Page'
          },

          {
            key: 'etatLibelle',
            header: 'Etat'
          },

          {
            key: 'description',
            header: 'Description'
          },

          {
            key: 'dateDebut',
            header: 'Date début'
          },

          {
            key: 'dateFin',
            header: 'Date Fin'
          }

        ];

        this.exerciceData = this.exerciceData.map(
          (item: any) => ({
            ...item
          })
        );

        this.isLoading = false;
      },


      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }

    });
  }

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.titre) {
      filtreObj.titre = this.activeFilters.titre;
    }

    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }

    return Object.keys(filtreObj).length > 0 ? filtreObj : null;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesExercices(this.hasActiveFilters);
    }
  }

  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonneesExercices(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltresExercice();
    this.currentPage = 0;
    this.chargerLesDonneesExercices(false);
  }

  today(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date().toLocaleDateString('fr-FR', options);
  }

}
