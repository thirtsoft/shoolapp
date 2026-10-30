import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableReferentielComponent } from '../../../../../core/generic/generic-table-referentiel/generic-table-referentiel.component';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { TypeServiceOffert } from '../../../../../core/models/referentiels/type-service-offert';
import { CommonService } from '../../../../../core/services/common.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ParentSessionService } from '../../../service/parent-session.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-list-service-offert-component',
  standalone: true,
  imports: [GenericTableReferentielComponent],
  templateUrl: './list-service-offert-component.html',
  styleUrl: './list-service-offert-component.css',
})
export class ListServiceOffertComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "tarif";
  columns: any = [];
  tarifData: any = [];

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];
  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  moisList: any[] = [];
  niveauId?: number;
  nomNiveauConcerne = '';

  private readonly parentSession = inject(ParentSessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commonService = inject(CommonService);
  private readonly planificationResource = inject(PlanificationResourceService);

  constructor() {
    const eleve = this.parentSession.getEleveResume();
    if (eleve) {
      this.niveauId = eleve.niveauId;
      this.nomNiveauConcerne = `${eleve.niveauEleve ?? ''}`.trim();
    }
  }

  ngOnInit(): void {
    this.chargerLesTarifs();
  }

  private chargerLesTarifs(): void {
    this.chargerLesDonnees();
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(val =>
      val !== null && val !== undefined && val !== ''
    );
    this.currentPage = 0;
    this.chargerLesDonnees();
  }

  chargerLesDonnees() {
    this.isLoading = true;
    let apiCall = this.planificationResource.getResourceByIdPaged('referentiel/tarif/niveau', this.niveauId!, this.currentPage, this.pageSize);
    apiCall.subscribe({
      next: (response) => {
        this.tarifData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;
        this.columns = [
          { key: 'niveau', header: 'Niveau' },
          { key: 'typeService', header: 'Type service' },
          { key: 'montant', header: 'Montant' },
          { key: 'anneeScolaire', header: 'Annee scolaire' }
        ];
        this.tarifData = this.tarifData.map((item: any) => ({
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


  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonnees();
    }
  }

  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonnees();
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.currentPage = 0;
    this.chargerLesDonnees();
  }
}
