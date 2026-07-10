import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IFilterConfig } from '../../../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { MedecinTraitant } from '../../../../../../core/models/parent/parent';
import { DossierEleveService } from '../../../service/dossier-eleve.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-liste-eleve',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './liste-eleve.component.html',
  styleUrls: ['./liste-eleve.component.css']
})
export class ListeEleveComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataEleve: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteEndpoint = "eleve";
  columns: any = [];
  eleveData: any = [];

  public readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  medeccinTraitantList: any[] = [];
  sexesOptions: string[] = ['Masculin', 'Féminin'];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  private readonly router = inject(Router);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly dossierResource = inject(DossierResourceService);


  ngOnInit(): void {
    this.chargerLaListeDesEleves();

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
      {
        key: 'medecin',
        label: 'Medecin traitant',
        type: 'select',
        options: this.medeccinTraitantList.map(c => ({
          value: c.id,
          label: c.prenom + " " + c.nom
        })),
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
      apiCall = this.dossierResource.fetchFilterDataTable(
        'eleve',
        this.currentPage,
        this.pageSize,
        filtreParam)
    } else {
      apiCall = this.dossierResource.getResourcePaged('eleve', this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        console.log('Data response', response);
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
