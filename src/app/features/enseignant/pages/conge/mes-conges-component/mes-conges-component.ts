import { Component, inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { RhResourceService } from '../../../../rh/services/rh-resource-service';

@Component({
  selector: 'app-mes-conges-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './mes-conges-component.html',
  styleUrl: './mes-conges-component.css',
})
export class MesCongesComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataConges: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "conges";
  columns: any = [];
  congesData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  congeAConfirmer: any = null;
  showConfirmationModal = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly rhResource = inject(RhResourceService);
  private readonly commonService = inject(CommonService);
  private readonly toast = inject(ToastrService);

  constructor() { }

  ngOnInit(): void {
    this.chargerMesConges();
  }


  async chargerMesConges() {
    try {
      await Promise.all([
        this.getMoisList(),
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
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
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        }))
      }
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

      const filtreParam = this.construireParametreFiltre();

      apiCall = this.planificationResource.fetchFilterDataTable(
        'conges/demandeur',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('conges/demandeur', this.currentPage, this.pageSize);
    } apiCall.subscribe({
      next: (response) => {
        this.congesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'objet', header: 'Objet' },
          { key: 'periode', header: 'Période' },
          { key: 'motif', header: 'Motif' },
          { key: 'etat', header: 'Etat' },
        ];
        this.congesData = this.congesData.map((item: any) => ({
          ...item,
          periode: this.formaterPeriode(item.dateDebut, item.dateFin)
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  formaterPeriode(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) {
      return '-';
    }
    const debut = new Date(dateDebut + 'T00:00:00');
    const fin = new Date(dateFin + 'T00:00:00');
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    const jourDebut = debut.getDate();
    const jourFin = fin.getDate();

    const moisDebut = mois[debut.getMonth()];
    const moisFin = mois[fin.getMonth()];

    if (
      debut.getMonth() === fin.getMonth() &&
      debut.getFullYear() === fin.getFullYear()
    ) {
      return `${jourDebut} → ${jourFin} ${moisDebut}`;
    }

    if (debut.getFullYear() === fin.getFullYear()) {
      return `${jourDebut} ${moisDebut} → ${jourFin} ${moisFin}`;
    }

    return `${jourDebut} ${moisDebut} ${debut.getFullYear()} → ${jourFin} ${moisFin} ${fin.getFullYear()}`;
  }

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.anneeScolaire) {
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

  confirmerSoumission(conge: any): void {
    this.congeAConfirmer = conge;
    this.showConfirmationModal = true;
  }

  annulerSoumission(): void {
    this.showConfirmationModal = false;
    this.congeAConfirmer = null;
  }

  soumettreConge(): void {
    if (!this.congeAConfirmer?.id) {
      return;
    }

    const congeId = this.congeAConfirmer.id;

    this.rhResource.soumettreConges(congeId)
      .subscribe({
        next: () => {
          this.showConfirmationModal = false;
          this.congeAConfirmer = null;

          this.toast.success('success', `La demande "${this.congeAConfirmer.motif}" a été envoyée avec succès.`);

          this.chargerLesDonnees(this.hasActiveFilters);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la soumission du congé:',
            error
          );
        }
      });
  }


}


