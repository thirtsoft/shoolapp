import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AssiduiteEleveParentResponse, DashboardFinancierParentResponse, DerniereAbsenceParentResponse, DerniereNoteParentResponse, EmploiDuTempsJourParentResponse, ProchaineActiviteParentResponse, ProchaineEvaluationParentResponse, ProchainExerciceParentResponse } from '../../../../core/models/dashboard/dashboard-parent.model';
import { DashboardParentService } from '../../service/dashboard-parent.service';
import { ParentSessionService } from '../../service/parent-session.service';


@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-parent-component.html',
  styleUrl: './dashboard-parent-component.css'
})
export class DashboardParentComponent {

  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardParentService);
  private readonly sessionService = inject(ParentSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listeEleves = this.sessionService.listeEleves;
  readonly eleveActif = this.sessionService.eleveActif;
  readonly parentDetails = this.sessionService.parentDetails;

  readonly parent = signal({ nomComplet: '', civility: '' });

  loading = signal(false);

  emploiDuTemps: EmploiDuTempsJourParentResponse[] = [];

  assiduite: AssiduiteEleveParentResponse = { nombreAbsences: 0, nombreRetards: 0 };

  situationFinanciere: DashboardFinancierParentResponse = {
    situationFinanciere: {
      resteAPayer: 0,
      devise: 'FCFA',
      statut: 'A_JOUR',
      nombreFactures: 0,
      nombreFacturesEnRetard: 0
    },
    derniereFacture: null
  };

  dernieresNotes: DerniereNoteParentResponse[] = [];
  dernieresAbsences: DerniereAbsenceParentResponse[] = [];
  prochainesEvaluations: ProchaineEvaluationParentResponse[] = [];
  prochainsExercices: ProchainExerciceParentResponse[] = [];
  prochainesActivites: ProchaineActiviteParentResponse[] = [];

  messages = [
    {
      auteur: 'M. Ndiaye',
      fonction: 'Professeur de Mathématiques',
      message: 'Note de mathématiques',
      date: 'Il y a 2 heures',
      nonLu: true,
      compteur: 1
    },
    {
      auteur: 'Direction',
      fonction: '',
      message: 'Informations importantes',
      date: 'Il y a 5 heures',
      nonLu: true,
      compteur: 2
    },
    {
      auteur: 'Mme Fall',
      fonction: 'CPE',
      message: 'Absence justifiée',
      date: 'Hier',
      nonLu: false,
      compteur: 0
    }
  ];

  informations = [
    'Les bulletins du 1er trimestre sont disponibles.',
    'Pensez à régler la mensualité avant la date d’échéance.',
    'Une réunion parents-professeurs est prévue prochainement.'
  ];

  accesRapides = [
    {
      libelle: 'Notes et bulletins',
      icon: '▤',
      couleur: 'blue'
    },
    {
      libelle: 'Absences',
      icon: '▣',
      couleur: 'red'
    },
    {
      libelle: 'Paiements',
      icon: '▱',
      couleur: 'green'
    },
    {
      libelle: 'Emploi du temps',
      icon: '▦',
      couleur: 'purple'
    },
    {
      libelle: 'Exercices',
      icon: '▥',
      couleur: 'orange'
    },
    {
      libelle: 'Cantine',
      icon: '♜',
      couleur: 'cyan'
    }
  ];

  constructor() {
    this.chargerParent();

    this.sessionService.changement$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.chargerDashboard();
      });

    if (this.eleveActif()) {
      this.chargerDashboard();
    }
  }

  private chargerParent(): void {
    const details = this.sessionService.getParentDetails();
    if (!details) {
      return;
    }
    this.parent.set({
      nomComplet: `${details.prenom || ''} ${details.nom || ''}`.trim(),
      civility: details.civility || ''
    });
  }

  private chargerDashboard(): void {
    const eleve = this.eleveActif();
    if (!eleve || eleve.id == null) {
      this.viderDonneesEleve();
      return;
    }

    this.loading.set(true);

    this.chargerEmploiDuTemps(eleve.classeId);
    this.chargerAssiduite(eleve.id);
    this.chargerSituationFinanciere(eleve.uuid);
    this.chargerDernieresNotes(eleve.id);
    this.chargerDernieresAbsences(eleve.id);
    this.chargerProchainesEvaluations(eleve.classeId!);
    this.chargerProchainsExercices(eleve?.classeId!);

    this.chargerProchainesActivites();

    this.loading.set(false);
  }

  private chargerEmploiDuTemps(classeId?: number | null): void {
    if (classeId == null) {
      this.emploiDuTemps = [];
      return;
    }

    this.dashboardService
      .getEmploiDuTempsDuJour(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.emploiDuTemps = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement de l’emploi du temps',
            error
          );

          this.emploiDuTemps = [];
        }
      });
  }

  private chargerAssiduite(eleveId: number): void {
    this.dashboardService
      .getAssiduiteEleve(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.assiduite = response ?? {
            nombreAbsences: 0,
            nombreRetards: 0
          };
        },
        error: error => {
          console.error(
            'Erreur lors du chargement de l’assiduité',
            error
          );

          this.assiduite = {
            nombreAbsences: 0,
            nombreRetards: 0
          };
        }
      });
  }

  private chargerSituationFinanciere(eleveUuid?: string | null): void {
    if (!eleveUuid) {
      this.situationFinanciere = this.getSituationFinanciereVide();
      return;
    }
    this.dashboardService
      .getSituationFinanciere(eleveUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.situationFinanciere = response ?? this.getSituationFinanciereVide();
        },
        error: error => {
          console.error(
            'Erreur lors du chargement de la situation financière',
            error
          );

          this.situationFinanciere = this.getSituationFinanciereVide();
        }
      });
  }

  private chargerDernieresNotes(eleveId: number): void {
    this.dashboardService
      .getDernieresNotesEleve(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.dernieresNotes = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement des dernières notes',
            error
          );

          this.dernieresNotes = [];
        }
      });
  }

  private chargerDernieresAbsences(eleveId: number): void {
    this.dashboardService
      .getDernieresAbsencesEleve(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.dernieresAbsences = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement des dernières absences',
            error
          );

          this.dernieresAbsences = [];
        }
      });
  }

  private chargerProchainesEvaluations(classeId: number): void {
    this.dashboardService
      .getProchainesEvaluations(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.prochainesEvaluations = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement des prochaines évaluations',
            error
          );

          this.prochainesEvaluations = [];
        }
      });
  }

  private chargerProchainsExercices(eleveId: number): void {
    this.dashboardService
      .getProchainsExercices(eleveId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.prochainsExercices = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement des prochains exercices',
            error
          );

          this.prochainsExercices = [];
        }
      });
  }

  private chargerProchainesActivites(): void {
    this.dashboardService
      .getProchainesActivites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.prochainesActivites = response ?? [];
        },
        error: error => {
          console.error(
            'Erreur lors du chargement des prochaines activités',
            error
          );

          this.prochainesActivites = [];
        }
      });
  }

  private getSituationFinanciereVide(): DashboardFinancierParentResponse {
    return {
      situationFinanciere: {
        resteAPayer: 0,
        devise: 'FCFA',
        statut: 'A_JOUR',
        nombreFactures: 0,
        nombreFacturesEnRetard: 0
      },
      derniereFacture: null
    };
  }

  private viderDonneesEleve(): void {

    this.emploiDuTemps = [];

    this.assiduite = {
      nombreAbsences: 0,
      nombreRetards: 0
    };

    this.situationFinanciere = this.getSituationFinanciereVide();

    this.dernieresNotes = [];
    this.dernieresAbsences = [];
    this.prochainesEvaluations = [];
    this.prochainsExercices = [];
  }

  accederALaPage(libellePage: string): void {

    switch (libellePage) {

      case 'Notes et bulletins':
        this.voirNotes();
        break;

      case 'Absences':
        this.voirAbsences();
        break;

      case 'Paiements':
        this.voirPaiements();
        break;

      case 'Emploi du temps':
        this.voirEmploiDuTemps();
        break;

      case 'Exercices':
        this.voirExercices();
        break;

      case 'Cantine':
        this.voirInformations();
        break;

      default:
        console.warn(
          `Aucune route définie pour l'accès rapide : ${libellePage}`
        );
        break;
    }
  }

  voirEmploiDuTemps(): void {
    void this.router.navigate(['/parent/cours']);
  }

  voirNotes(): void {
    void this.router.navigate(['/parent/notes']);
  }

  voirAbsences(): void {
    void this.router.navigate(['/parent/absences']);
  }

  voirPaiements(): void {
    void this.router.navigate(['/parent/factures']);
  }

  voirEvaluations(): void {
    void this.router.navigate(['/parent/evaluations']);
  }

  voirExercices(): void {
    void this.router.navigate(['/parent/exercices']);
  }

  voirEvenements(): void {
    void this.router.navigate(['/parent/evenements']);
  }

  voirMessages(): void {
    console.log('Navigation vers messages');
  }

  voirInformations(): void {
    void this.router.navigate(['/parent/informations']);
  }
}