import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FicheEmargementMensuelleResponse, FichesEmargementMensuellesResponse } from '../../../../../core/models/ficheemargement/fiche-emargement-mensuelle-response.model';

import { GenerationFichesEmargementResponse } from '../../../../../core/models/ficheemargement/generation-fiches-emargement-response.model';
import { GenererFichesEmargementRequest } from '../../../../../core/models/ficheemargement/generer-fiches-emargement-request.model';

import { Router } from '@angular/router';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { RhResourceService } from '../../../services/rh-resource-service';


@Component({
  selector: 'app-fiches-emargement-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fiches-emargement-component.html',
  styleUrl: './fiches-emargement-component.css'
})
export class FichesEmargementComponent implements OnInit {

  private readonly rhResource = inject(RhResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);

  errorMessage?: string;
  successMessage?: string;

  isLoading = false;
  isGenerating = false;

  mois = new Date().getMonth() + 1;
  annee = new Date().getFullYear();

  limite = 10;

  anneeScolaireUuid?: string;
  anneeScolaireLibelle?: string;

  fichesResponse?: FichesEmargementMensuellesResponse;

  fiches: FicheEmargementMensuelleResponse[] = [];

  readonly limites = [10, 25, 50, 100];

  readonly moisLabels = [
    '',
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ];


  ngOnInit(): void {
    this.chargerAnneeScolaireEncours();
  }

  chargerAnneeScolaireEncours(): void {

    this.isLoading = true;
    this.errorMessage = undefined;

    this.referentielResource
      .recupererAnneeScolaireEnCours('anneescolaire-encours')
      .subscribe({
        next: response => {

          const anneeScolaire = response;

          this.anneeScolaireUuid = anneeScolaire.anneeScolaireUuid;
          this.anneeScolaireLibelle = anneeScolaire.libelle;

          if (!this.anneeScolaireUuid) {
            this.errorMessage = 'Impossible de déterminer l’année scolaire active.';
            this.isLoading = false;
            return;
          }

          this.chargerLesDonnees();
        },

        error: error => {

          console.error(
            'Erreur chargement année scolaire en cours :',
            error
          );

          this.errorMessage = 'Impossible de charger l’année scolaire en cours.';
          this.fiches = [];
          this.fichesResponse = undefined;
          this.isLoading = false;
        }
      });
  }

  chargerLesDonnees(): void {

    if (!this.anneeScolaireUuid) {
      this.errorMessage = 'Impossible de déterminer l’année scolaire active.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = undefined;

    this.rhResource
      .getFichesEmargement(this.mois, this.annee, this.anneeScolaireUuid, this.limite)
      .subscribe({
        next: response => {

          this.fichesResponse = response;
          this.fiches = response.fiches ?? [];

          this.isLoading = false;
        },

        error: error => {

          console.error('Erreur chargement fiches émargement :', error);

          this.errorMessage = 'Impossible de charger les fiches d’émargement.';
          this.fiches = [];
          this.fichesResponse = undefined;
          this.isLoading = false;
        }
      });
  }


  changerMois(): void {
    this.chargerLesDonnees();
  }

  changerAnnee(): void {
    this.chargerLesDonnees();
  }

  changerLimite(): void {
    this.chargerLesDonnees();
  }

  genererFiches(): void {

    if (!this.anneeScolaireUuid) {
      this.errorMessage = 'Impossible de déterminer l’année scolaire active.';
      return;
    }

    this.isGenerating = true;
    this.errorMessage = undefined;
    this.successMessage = undefined;

    const request: GenererFichesEmargementRequest = {
      mois: this.mois,
      annee: this.annee
    };

    this.rhResource
      .genererFichesEmargement(request)
      .subscribe({

        next: (response: GenerationFichesEmargementResponse) => {

          this.successMessage = response.message ?? 'Les fiches d’émargement ont été générées avec succès.';

          this.isGenerating = false;

          this.chargerLesDonnees();
        },

        error: error => {
          console.error('Erreur génération fiches émargement :', error);
          this.errorMessage = 'Impossible de générer les fiches d’émargement.';
          this.isGenerating = false;
        }
      });
  }

  private readonly router = inject(Router);


  consulterFiche(fiche: FicheEmargementMensuelleResponse): void {


    if (!fiche.ficheUuid) {
      return;
    }
    void this.router.navigate(['/admin/rh/fiche-emargement/details', fiche.ficheUuid])
    console.log('Consulter fiche :', fiche.ficheUuid);
  }


  getNomEnseignant(fiche: FicheEmargementMensuelleResponse): string {
    const prenom = fiche.enseignantPrenom?.trim() ?? '';
    const nom = fiche.enseignantNom?.trim() ?? '';
    return `${prenom} ${nom}`.trim() || 'Enseignant';
  }


  getInitiales(fiche: FicheEmargementMensuelleResponse): string {
    const prenom = fiche.enseignantPrenom?.trim() ?? '';
    const nom = fiche.enseignantNom?.trim() ?? '';

    const premiereLettrePrenom = prenom ? prenom.charAt(0) : '';
    const premiereLettreNom = nom ? nom.charAt(0) : '';

    return (`${premiereLettrePrenom}${premiereLettreNom}`).toUpperCase() || 'EN';
  }


  getProgression(fiche: FicheEmargementMensuelleResponse): number {
    const prevues = fiche.nombreSeancesPrevues ?? 0;
    const effectuees = fiche.nombreSeancesEffectuees ?? 0;

    if (prevues <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((effectuees / prevues) * 100));
  }


  getEtatClass(fiche: FicheEmargementMensuelleResponse): string {
    switch (fiche.etatCode) {

      case 'VALIDEE':
        return 'validated';

      case 'ENVOYE':
        return 'submitted';

      case 'REJETE':
        return 'returned';

      case 'EN_COURS':
        return 'progress';

      default:
        return 'progress';
    }
  }


  getEtatIcon(fiche: FicheEmargementMensuelleResponse): string {

    switch (fiche.etatCode) {

      case 'VALIDEE':
        return '✓';

      case 'ENVOYE':
        return '!';

      case 'REJETE':
        return '↻';

      case 'EN_COURS':
        return '●';

      default:
        return '●';
    }
  }


  getEtatLibelle(fiche: FicheEmargementMensuelleResponse): string {
    switch (fiche.etatCode) {

      case 'VALIDEE':
        return 'Validée';

      case 'ENVOYE':
        return 'À contrôler';

      case 'REJETE':
        return 'Retournée';

      case 'EN_COURS':
        return 'En cours';

      default:
        return fiche.etatLibelle ?? '—';
    }
  }

  getMoisLibelle(): string {
    return this.moisLabels[this.mois] ?? '';
  }
}