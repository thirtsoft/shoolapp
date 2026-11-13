import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { IFilterConfig } from '../../../../../../core/models/filtreconfiguration/FiltreConfiguration';
import { CommonService } from '../../../../../../core/services/common.service';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';
import { RechercheAbsence } from '../../../../../../core/models/dossiereleve/absence/rechercher-absence';

@Component({
  selector: 'app-liste-absence',
  standalone: true,
  imports: [GenericTableDossierComponent],
  templateUrl: './liste-absence.component.html',
  styleUrls: ['./liste-absence.component.css']
})
export class ListeAbsenceComponent implements OnInit {

  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];
  attendRecordData: any = [];
  isEdit: boolean = true;

  userId?: number;
  eleveId?: number;
  classeId?: number;
  deleteEndpoint = "attendRecord";

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  anneesScolairesList: any[] = [];
  semestreList: any[] = [];
  sessionSemestreList: any[] = [];
  classeList: any[] = [];
  moisList: any[] = [];
  anneeList: any[] = [];
  typeAbsenceList: string[] = ['PRESENCE', 'ABSENCE', 'RETARD'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: Partial<RechercheAbsence> = {};
  hasActiveFilters: boolean = false;

  private readonly dossierEleveService = inject(DossierResourceService);
  private readonly commonService = inject(CommonService);
  private readonly referentielResourceService = inject(ReferentielResourceService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.chargerLesAttendRecordsEleve();
  }

  async chargerLesAttendRecordsEleve() {
    try {
      await this.chargerLesDonneesFiltre();

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  private async chargerLesDonneesFiltre(): Promise<void> {
    try {
      const [sessionSemestres, classes, anneesScolaires, mois, annees] = await Promise.all([
        firstValueFrom(this.referentielResourceService.getResourceList('sessionsemestre')),
        firstValueFrom(this.referentielResourceService.getResourceList('classe')),
        firstValueFrom(this.referentielResourceService.getResourceList('anneescolaire')),
        firstValueFrom(this.commonService.getAllMois()),
        firstValueFrom(this.commonService.getAllAnnees())
      ]);

      this.sessionSemestreList = sessionSemestres || [];
      this.classeList = classes || [];
      this.anneesScolairesList = anneesScolaires || [];
      this.moisList = mois || [];
      this.anneeList = annees || [];
    } catch (error) {
      console.error('Erreur lors du chargement des données de filtre:', error);
      throw error;
    }
  }

  chargerLesDonnees(useFilterApi: boolean) {
    this.isLoading = true;
    let resultatAPI;

    if (useFilterApi) {

      const filtreParam = this.construireLesParametresDeFiltre();


      resultatAPI = this.dossierEleveService.filteredFilterDataTable(
        'attendancerecord', this.currentPage, this.pageSize, filtreParam)

    } else {
      resultatAPI = this.dossierEleveService.getResourcePaged('attendancerecord', this.currentPage, this.pageSize);
    }
    resultatAPI.subscribe({
      next: (response) => {
        this.attendRecordData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'nomCompletEleve', header: 'Elève' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'anneeScolare', header: 'Année scolaire' },
          { key: 'attendanceStatus', header: 'Type absence' },
          {
            key: 'course',
            header: 'Cours',
            valueGetter: (record: any) => record.courseLibelle || '-'
          },

          { key: 'attendanceDate', header: 'Date absence' },
        ];

        this.attendRecordData = this.attendRecordData.map((item: any) => ({
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
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(s => ({
          value: s.id,
          label: s.semestre
        })),
      },
      {
        key: 'status',
        label: 'Type',
        type: 'select',
        options: this.typeAbsenceList.map(a => ({
          value: a,
          label: a
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


  onFilterChange(filter: IFilterConfig, value: any): void {

    this.activeFilters[filter.key as keyof RechercheAbsence] = value;

    this.hasActiveFilters = Object.values(this.activeFilters).some(
      value => value !== null &&
        value !== undefined &&
        value !== ''
    );

    this.currentPage = 0;

    this.chargerLesDonnees(this.hasActiveFilters);
  }

  construireLesParametresDeFiltre(): RechercheAbsence {

    const filtre: RechercheAbsence = {};

    const { nomPrenom, sessionSemestre, status, mois, anneeScolaire } = this.activeFilters;

    if (nomPrenom?.trim()) {
      filtre.nomPrenom = nomPrenom.trim();
    }

    if (sessionSemestre) {
      filtre.sessionSemestre = sessionSemestre;
    }

    if (status?.trim()) {
      filtre.status = status.trim();
    }

    if (mois) {
      filtre.mois = mois;
    }



    if (anneeScolaire) {
      filtre.anneeScolaire = anneeScolaire;
    }

    return filtre;
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
