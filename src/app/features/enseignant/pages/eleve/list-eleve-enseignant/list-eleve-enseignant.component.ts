import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { MedecinTraitant } from '../../../../../core/models/parent/parent';
import { DossierEleveService } from '../../../../administration/dossier-eleve/service/dossier-eleve.service';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignantService } from '../../../service/enseignant.service';

@Component({
  selector: 'app-list-eleve-enseignant',
  standalone: true,
  imports: [CommonModule, GenericTableDossierComponent],
  templateUrl: './list-eleve-enseignant.component.html',
  styleUrls: ['./list-eleve-enseignant.component.css']
})
export class ListEleveEnseignantComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEleve: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "eleve";
  columns: any = [];
  eleveData: any = [];

  readonly String = String;

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  tableSizes = [5, 10, 20, 50, 100];

  medeccinTraitantList: any[] = [];
  sexesOptions: string[] = ['Masculin', 'Féminin'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;
  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  userId: number;
  enseignantId?: number;


  private readonly dossierResource = inject(DossierResourceService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly enseignantSerivce = inject(EnseignantService);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getEnseignementByUtilisateur(this.userId);
  }

  getEnseignementByUtilisateur(userId: number) {
    this.enseignantSerivce.getDetailsEnseignantUtilisateur(userId).subscribe({
      next: (data) => {
        this.detailsEnseignant = data;
        this.enseignantId = this.detailsEnseignant?.id;
        this.chargerLaListeDesEleves();
      },
      error: (err) => (err)
    });
  }

  async chargerLaListeDesEleves() {
    try {
      await Promise.all([
        this.getMedeccinTraitantList()
      ]);

      this.initialisationDesFiltres();
      this.chargerLesDonnees(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getMedeccinTraitantList(): Promise<MedecinTraitant[]> {
    return new Promise((resolve, reject) => {
      this.dossierEleveService.getResourceList('eleve/medecintraitant').subscribe({
        next: (data: any) => {
          this.medeccinTraitantList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltres() {
    this.tableFilters = [
      {
        key: 'matricule',
        label: 'Matricule',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'nomPrenom',
        label: 'Nom/Prénom',
        type: 'text',
        placeholder: 'Rechercher un élève...'
      },
      {
        key: 'sexe',
        label: 'Sexe',
        type: 'select',
        options: this.sexesOptions.map(s => ({
          value: s,
          label: s
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
      const filtreParam = this.construireLesParametreDeFiltre();
      apiCall = this.dossierResource.fetchFilterByElementDataTable(
        'eleve/enseignant',
        this.currentPage,
        this.pageSize,
        filtreParam)
    } else {
      apiCall = this.planification.getResourceByIdPaged('eleve/enseignant', this.enseignantId!, this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.eleveData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        console.log('Eleves', this.eleveData)

        this.columns = [
          { key: 'matricule', header: 'Matricule' },
          { key: 'prenom', header: 'Prenom' },
          { key: 'nom', header: 'Nom' },
          { key: 'sexe', header: 'Sexe' },
          { key: 'adresse', header: 'Adresse' },
          { key: 'lieu', header: 'Lieu naissance' },
          { key: 'dateNaissance', header: 'Date naissance' },

        ];
        this.eleveData = this.eleveData?.map((item: any) => ({
          ...item,
        }));
        console.log('Data {}', this.eleveData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireLesParametreDeFiltre(): any {
    const filtreObj: any = {};
    if (this.activeFilters.matricule) {
      filtreObj.matricule = this.activeFilters.matricule;
    }
    if (this.activeFilters.nomPrenom) {
      filtreObj.nomPrenom = this.activeFilters.nomPrenom;
    }
    if (this.activeFilters.sexe) {
      filtreObj.sexe = this.activeFilters.sexe;
    }

    if (this.activeFilters.dateFrom || this.activeFilters.dateTo) {
      filtreObj.dateNaissance = {
        from: this.activeFilters.dateNaissanceDebut,
        to: this.activeFilters.dateNaissanceFin
      };
    }

    if (this.activeFilters.medecin) {
      filtreObj.medecin = this.activeFilters.medecin;
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

  ajouterEleve() {
    this.router.navigate(['/admin/dossier-eleve/inscrire-eleve']);
  }

  ajouterEleve01() {
    this.router.navigate(['/admin/dossier-eleve/eleve']);
  }

  editerEleve(eleveId: number) {
    this.router.navigate(['/admin/dossier-eleve/eleve', eleveId]);
  }

  voirDetailEleve(eleveId: number) {
    this.router.navigate(['/admin/dossier-eleve/details', eleveId]);
  }


}
