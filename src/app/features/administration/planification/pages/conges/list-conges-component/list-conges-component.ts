import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { CommonService } from '../../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { Etat } from '../../../../referentiel/pages/semestre/editer-session-semestre-component/editer-session-semestre-component';
import { UtilisateurList } from '../../../../../../core/models/utilisateur/utilisateur-list';
import { ToastrService } from 'ngx-toastr';
import { RhResourceService } from '../../../../../rh/services/rh-resource-service';

@Component({
  selector: 'app-list-conges-component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-conges-component.html',
  styleUrl: './list-conges-component.css',
})
export class ListCongesComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataConges: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "conges";
  columns: any = [];
  congesData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  statusEvenementOptions: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];
  etatCongesList: Etat[] = [
    {
      id: 8,
      code: 'E8',
      libelle: 'En cours',

    },
    {
      id: 3,
      code: 'E3',
      libelle: 'Envoyée',

    },
    {
      id: 15,
      code: 'E15',
      libelle: 'Accepte',

    },
    {
      id: 16,
      code: 'E16',
      libelle: 'Rejete',

    }
  ];
  demanderCongesList: UtilisateurList[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  congeAConfirmer: any = null;
  showConfirmationModal = false;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly commonService = inject(CommonService);
  private readonly rhResource = inject(RhResourceService);
  private readonly toast = inject(ToastrService);

  ngOnInit(): void {
    this.chargerLesConges();
  }

  async chargerLesConges() {
    try {
      await Promise.all([
        this.getMoisList(),
        this.getAnneesList(),
        this.getDemanderCongesList()
      ]);
      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getDemanderCongesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.planificationResource.getResourceList('utilisateur/demandeur-conges').subscribe({
        next: (data: any) => {
          this.demanderCongesList = data;
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

  getAnneesList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllAnnees().subscribe({
        next: (data) => {
          this.anneeList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'objet',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un congé...'
      },
      {
        key: 'demandeurId',
        label: 'Demandeur',
        type: 'select',
        options: this.demanderCongesList.map(d => ({
          value: d.id,
          label: d.nomComplet
        }))
      },

      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatCongesList.map(e => ({
          value: e.id,
          label: e.libelle
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
      {
        key: 'annee',
        label: 'Année',
        type: 'select',
        options: this.anneeList.map(a => ({
          value: a.annee,
          label: a.annee
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

      apiCall = this.planificationResource.fetchFilterDataTable(
        'conges',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planificationResource.getResourcePaged('conges', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.congesData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'objet', header: 'Objet' },
          { key: 'motif', header: 'Motif' },
          { key: 'periode', header: 'Période' },

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

  construireLesParamereDeFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.objet) {
      filtreObj.objet = this.activeFilters.objet;
    }
    if (this.activeFilters.demandeurId) {
      filtreObj.demandeurId = this.activeFilters.demandeurId;
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

