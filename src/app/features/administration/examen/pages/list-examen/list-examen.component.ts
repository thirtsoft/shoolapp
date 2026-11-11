import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { ExamenResponse } from '../../../../../core/models/examen/eleve-examen-response';
import { AnneeScolaireEncoursResponse } from '../../../../../core/models/referentiels/annee-scolaire-encours-response';
import { ReferentielResourceService } from '../../../referentiel/service/referentiel-resource.service';
import { ExamenResourceService } from '../../service/examen-resource.service';

type StatutFiltre =
  | 'TOUS'
  | 'A_COMPLETER'
  | 'TERMINE';

@Component({
  selector: 'app-list-examen',
  standalone: true,
  imports: [],
  templateUrl: './list-examen.component.html',
  styleUrls: ['./list-examen.component.css']
})
export class ListExamenComponent implements OnInit {

  private readonly examenResourceService = inject(ExamenResourceService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly router = inject(Router);
  private readonly taostService = inject(ToastrService);

  examens = signal<ExamenResponse[]>([]);

  anneesScolaires = signal<AnneeScolaireEncoursResponse[]>([]);
  anneeScolaireEnCours = signal<AnneeScolaireEncoursResponse | null>(null);
  anneeScolaireFiltre = signal<AnneeScolaireEncoursResponse | null>(null);

  statutFiltre = signal<StatutFiltre>('TOUS');

  examensFiltres = computed(() => {

    let resultats = [...this.examens()];

    const annee = this.anneeScolaireFiltre();

    if (annee) {
      resultats = resultats.filter(examen => examen.anneeScolaireUuid === annee.anneeScolaireUuid);
    }

    const statut = this.statutFiltre();
    if (statut === 'TERMINE') {
      resultats = resultats.filter(examen => this.isExamenTermine(examen));

    } else if (statut === 'A_COMPLETER') {
      resultats = resultats.filter(examen => !this.isExamenTermine(examen));

    }
    return resultats;
  });

  ngOnInit(): void {
    this.chargerAnneesScolaire();
  }

  chargerAnneesScolaire(): void {
    this.referentielService
      .getResourceList<AnneeScolaireEncoursResponse>(
        'anneescolaire/response'
      )
      .subscribe({
        next: response => {
          this.anneesScolaires.set(response);

          const aujourdHui = new Date();

          const anneeEnCours = response.find(annee => {
            if (!annee.dateDebut || !annee.dateFin) {
              return false;
            }

            const dateDebut = new Date(annee.dateDebut);
            const dateFin = new Date(annee.dateFin);

            return aujourdHui >= dateDebut && aujourdHui <= dateFin;
          });

          if (!anneeEnCours) {
            console.warn('Aucune année scolaire en cours trouvée.');
            return;
          }
          this.anneeScolaireEnCours.set(anneeEnCours);

          this.anneeScolaireFiltre.set(anneeEnCours);

          this.chargerExamens();
        },

        error: error => {
          console.error(
            'Erreur chargement des années scolaires :',
            error
          );
        }
      });
  }

  chargerExamens(): void {
    const annee = this.anneeScolaireFiltre();

    if (!annee) {
      this.examens.set([]);
      return;
    }

    this.examenResourceService
      .findExamens(annee.anneeScolaireUuid!)
      .subscribe({
        next: response => {
          this.examens.set(response);

        },
        error: error => {
          console.error('Erreur lors du chargement des examens :', error);
          this.examens.set([]);

        }

      });
  }

  genererExamens(): void {
    const annee = this.anneeScolaireEnCours();
    if (!annee) {
      console.warn('Impossible de générer les examens : ' + 'aucune année scolaire en cours.');
      return;
    }

    this.examenResourceService
      .genererExamens({
        anneeScolaireUuid:
          annee.anneeScolaireUuid!
      })
      .subscribe({

        next: () => {

          this.taostService.success('success', 'Les examens sont générés avec succès')

          this.chargerExamens();

        },

        error: error => {
          console.error(
            'Erreur lors de la génération des examens :',
            error
          );

        }

      });
  }

  changerAnneeScolaire(anneeUuid: string): void {

    const annee = this.anneesScolaires().find(
      item => item.anneeScolaireUuid === anneeUuid);

    if (!annee) {
      return;
    }

    this.anneeScolaireFiltre.set(annee);

    this.chargerExamens();
  }

  changerStatut(statut: string): void {
    this.statutFiltre.set(statut as StatutFiltre);
  }

  getProgression(examen: ExamenResponse): number {
    if (!examen.nombreEleves) {
      return 0;
    }
    return Math.min(
      100,
      Math.round(
        (
          examen.nombreResultats /
          examen.nombreEleves
        ) * 100
      )
    );
  }

  isExamenTermine(examen: ExamenResponse): boolean {
    return (
      examen.nombreEleves > 0 &&
      examen.nombreEleves ===
      examen.nombreResultats
    );
  }

  ouvrirDetailsExamen(examenUuid: string): void {
    void this.router.navigate(['/admin/examen/details', examenUuid]);
  }

  actualiser(): void {
    this.chargerExamens();
  }

}