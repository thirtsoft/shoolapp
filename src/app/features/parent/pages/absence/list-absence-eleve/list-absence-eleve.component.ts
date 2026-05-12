import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { CommonService } from '../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { Semestre } from '../../../../../core/models/referentiels/semestre';


@Component({
  selector: 'app-list-absence-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './list-absence-eleve.component.html',
  styleUrls: ['./list-absence-eleve.component.css']
})
export class ListAbsenceEleveComponent implements OnInit {

  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  absenceData: any = [];
  isEdit: boolean = true;

  userId?: number;
  eleveId?: number;
  classeId?: number;
  isNonAdministration: boolean = false;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  semestreList: any[] = [];
  classeList: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly dossierEleveService = inject(DossierResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly commonService = inject(CommonService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
  }

  ngOnInit(): void {
    this.chargerLesAbsencesEleve();
  }

  async chargerLesAbsencesEleve() {
    try {
      await Promise.all([
        this.getSemestreList(),
        this.getAnneeScolaires(),
        this.getMoisList(),
        this.getAnneesList()

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

  getSemestreList(): Promise<Semestre[]> {
    return new Promise((resolve, reject) => {
      this.referentielService.getAllSemestres().subscribe({
        next: (data) => {
          this.semestreList = data;
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

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let resultatAPI;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametreDeFiltre();

      resultatAPI = this.dossierEleveService.fetchFilterByElementDataTable(
        'absence/eleve',
        this.eleveId!,
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      resultatAPI = this.dossierEleveService.getResourcesByIdPaged('absence/eleve', this.eleveId!, this.currentPage, this.pageSize);
    }
    resultatAPI.subscribe({
      next: (response) => {
        this.absenceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'semestre', header: 'Semestre' },
          { key: 'anneeScolare', header: 'Année scolaire' },
          { key: 'libelleJustifiee', header: 'Etat absence' },
          { key: 'dateAbsence', header: 'Date absence' },
          { key: 'date_declaration', header: 'Date déclaration' },
        ];

        this.absenceData = this.absenceData.map((item: any) => ({
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

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'semestre',
        label: 'Semestre',
        type: 'select',
        options: this.semestreList.map(c => ({
          value: c.id,
          label: c.libelle
        })),
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

  construireLesParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.semestre) {
      filtreObj.semestre = this.activeFilters.semestre;
    }

    if (this.activeFilters?.anneeScolaire) {
      filtreObj.anneeScolaire = this.activeFilters.anneeScolaire;
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }


}
