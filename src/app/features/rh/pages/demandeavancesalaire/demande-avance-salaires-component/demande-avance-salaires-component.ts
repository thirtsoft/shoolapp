import { Component, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { RhResourceService } from '../../../services/rh-resource-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-demande-avance-salaires-component',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './demande-avance-salaires-component.html',
  styleUrl: './demande-avance-salaires-component.css',
})
export class DemandeAvanceSalairesComponent implements OnInit {
  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "personnel";
  columns: any = [];
  demandeAvSalaireData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  demandeAConfirmer: any = null;
  showConfirmationModal = false;

  private readonly rhResource = inject(RhResourceService);
  private readonly toast = inject(ToastrService);

  ngOnInit(): void {
    void this.chargerLesDemandeAvSalaires()
  }

  async chargerLesDemandeAvSalaires() {
    try {
      await Promise.all([
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'libelle',
        label: 'Libelle',
        type: 'text',
        placeholder: 'Rechercher un type contrat'
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

      apiCall = this.rhResource.fetchFilterDataTable(
        'demandes-avance-salaire',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.rhResource.getResourcePaged('demandes-avance-salaire', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.demandeAvSalaireData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'numeroDemande', header: 'N°' },
          { key: 'beneficiaire', header: 'Bénéficiaire' },
          { key: 'montant', header: 'Montant' },
          { key: 'motif', header: 'Motif' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateDemande', header: 'Date' },
        ];
        this.demandeAvSalaireData = this.demandeAvSalaireData.map((item: any) => ({
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

    if (this.activeFilters.libelle) {
      filtreObj.libelle = this.activeFilters.libelle;
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
    this.demandeAConfirmer = conge;
    this.showConfirmationModal = true;
  }

  annulerSoumission(): void {
    this.showConfirmationModal = false;
    this.demandeAConfirmer = null;
  }

  soumettreConge(): void {
    if (!this.demandeAConfirmer?.uuid) {
      return;
    }

    const demandeUuid = this.demandeAConfirmer.uuid;

    this.rhResource.soumettreDemande(demandeUuid)
      .subscribe({
        next: () => {
          this.showConfirmationModal = false;
          this.demandeAConfirmer = null;

          this.toast.success('success', `La demande "${this.demandeAConfirmer.numeroDemande}" a été envoyée avec succès.`);

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
