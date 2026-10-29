import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ComptabiliteResourceService } from '../../../../comptabilite/services/comptabilite-resource.service';
import { ParentSessionService } from '../../../service/parent-session.service';

@Component({
  selector: 'app-list-invoice-eleve',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './list-invoice-eleve.component.html',
  styleUrls: ['./list-invoice-eleve.component.css']
})
export class ListInvoiceEleveComponent implements OnInit {

  isLoading: boolean = false;
  filteredFactureData: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  factureData: any = [];

  eleveUuId?: string;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  etatfactureOptions: any[] = [];
  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  nomEleveConcerne = '';

  private readonly parentSession = inject(ParentSessionService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly commonService = inject(CommonService);


  constructor() {
    const eleve = this.parentSession.getEleveResume();

    if (eleve) {
      this.eleveUuId = eleve.uuid;
      this.nomEleveConcerne = `${eleve.prenom ?? ''} ${eleve.nom ?? ''}`.trim();
    }
  }

  ngOnInit(): void {
    this.chargerLesFacturesEleve();

  }

  private chargerLesFacturesEleve(): void {
    this.isLoading = true;

    forkJoin({
      semestres: this.referentielResourceService.getResourceList('sessionsemestre'),
      mois: this.commonService.getAllMois(),
      etat: this.commonService.getAllStatusFactures()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: any) => {
          this.moisList = result.mois || [];
          this.etatfactureOptions = result.etat || [];

          this.initialisationDesFiltres();

          this.chargerLesDonnees(false);
        },

        error: (error) => {
          console.error('Erreur chargement des filtres:', error);
          this.isLoading = false;
        }
      });
  }


  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'numeroFacture',
        label: 'N° facture',
        type: 'text',
        placeholder: 'Rechercher une facture...'
      },
      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatfactureOptions.map(e => ({
          value: e.id,
          label: e.status
        }))
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

      apiCall = this.comptabiliteResource.fetchFilterByElementDataTable(
        'facture/eleve',
        this.eleveUuId,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.comptabiliteResource.getResourceByIdPaged('facture/eleve', this.eleveUuId, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.factureData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;


        this.columns = [
          { key: 'numeroFacture', header: 'N° facture' },
          { key: 'montant', header: 'Montant' },
          { key: 'etat', header: 'État' },
          { key: 'dateFacture', header: 'Date' },
          { key: 'echeanceDateFormatee', header: 'Date échéance' },
          { key: 'alerte', header: 'Alerte' }
        ];

        this.factureData = this.factureData.map((item: any) => {
          const alerte = this.genererAlerteFacture(
            item.etat,
            item.echeanceDate
          );

          return {
            ...item,
            echeanceDateFormatee: this.formaterDate(item.echeanceDate),
            alerte: alerte.message,
            alerteClass: alerte.class
          };
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  genererAlerteFacture(etat: string | null | undefined, echeanceDate: string | null | undefined): { message: string; class: string; } {

    if (etat?.toLowerCase() === 'payée') {
      return {
        message: '🟢 Payée',
        class: 'alerte-success'
      };
    }

    if (!echeanceDate) {
      return {
        message: '',
        class: ''
      };
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const echeance = new Date(echeanceDate);
    echeance.setHours(0, 0, 0, 0);

    if (echeance < aujourdHui) {
      return {
        message: '🔴 Échéance dépassée',
        class: 'alerte-warning'
      };
    }
    return {
      message: '🟠 À régler avant l’échéance',
      class: 'alerte-warning'
    };
  }


  formaterDate(date: string | null | undefined): string {
    if (!date) {
      return '';
    }
    const dateObj = new Date(date);

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  }

  genererAlerteEcheance(echeanceDate: string | null | undefined): string {

    if (!echeanceDate) {
      return '';
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const echeance = new Date(echeanceDate);
    echeance.setHours(0, 0, 0, 0);

    if (echeance < aujourdHui) {
      return '⚠️ Échéance dépassée';
    }

    return '✅ Échéance à venir';
  }

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.numeroFacture) {
      filtreObj.numeroFacture = this.activeFilters.numeroFacture;
    }
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    if (this.activeFilters.annee) {
      filtreObj.annee = this.activeFilters.annee;
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