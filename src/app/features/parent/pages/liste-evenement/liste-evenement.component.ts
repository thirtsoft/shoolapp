import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { CommonService } from '../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-liste-evenement',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './liste-evenement.component.html',
  styleUrls: ['./liste-evenement.component.css']
})
export class ListeEvenementComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEvenement: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  evenementData: any = [];

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly refentielResourceService = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.chargerLesActivitesScolaire();
  }

  private chargerLesActivitesScolaire(): void {
    this.isLoading = true;

    forkJoin({
      mois: this.commonService.getAllMois(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {

          this.moisList = result.mois || [];

          this.initialisationDesFiltres();

          this.chargerLesDonnees(false);
        },

        error: (error) => {
          console.error('Erreur chargement des filtres:', error);
          this.isLoading = false;
        }
      });
  }

  /*   async chargerLesActivitesScolaire() {
      try {
        await Promise.all([
          this.getMoisList(),
        ]);
        this.initialisationDesFiltres();
        this.chargerLesDonnees(false);
  
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    } */

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un évenement...'
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
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

      const filtreParam = this.construireLesParamereDeFiltre();

      apiCall = this.refentielResourceService.fetchFilterDataTable(
        'planification/activites/parent',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.refentielResourceService.getResourcePaged('planification/activites/parent', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        const content = response.data?.content || [];

        this.evenementData = content.map((item: any) => ({
          ...item,

          typeFormate: this.formaterTypeActivite(item.type),

          dateFormatee: this.formaterDate(item.date),

          horaireFormate: item.horaire || this.formaterHoraire(
            item.heureDebut,
            item.heureFin
          ),
          typeClass: this.getTypeActiviteClass(item.type),

          couleurClass: `activite-${item.couleur || 'blue'}`
        }));

        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'titre', header: 'Activité' },
          { key: 'typeFormate', header: 'Type' },
          { key: 'dateFormatee', header: 'Date' },
          { key: 'horaireFormate', header: 'Horaire' }
        ];

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  formaterTypeActivite(type: string): string {
    switch (type) {
      case 'EVENEMENT':
        return 'Événement';

      case 'REUNION':
        return 'Réunion';

      default:
        return type || '-';
    }
  }

  formaterDate(date: string): string {
    if (!date) {
      return '-';
    }

    const d = new Date(date + 'T00:00:00');

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formaterHoraire(heureDebut?: string, heureFin?: string): string {

    if (!heureDebut && !heureFin) {
      return '-';
    }

    const debut = heureDebut?.substring(0, 5) || '';
    const fin = heureFin?.substring(0, 5) || '';

    if (debut && fin) {
      return `${debut} - ${fin}`;
    }

    return debut || fin || '-';
  }

  getTypeActiviteClass(type: string): string {
    switch (type) {
      case 'EVENEMENT':
        return 'badge-evenement';

      case 'REUNION':
        return 'badge-reunion';

      default:
        return 'badge-activite';
    }
  }

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
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
