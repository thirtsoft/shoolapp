import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { OrganizationMiniResponse } from '../../../../core/models/onboarding/organization/organization-mini-response';
import { ActiviteAVenir } from '../../../../core/models/planification/activite-a-venir';
import { ConfigOrganizationService } from '../../configorganization/services/configorganization.service';
import { DashboardService } from '../../dossier-eleve/service/dashboard.service';

interface KpiDirection {
  label: string;
  valeur: string;
  detail: string;
  icon: string;
  classe: string;
  action?: () => void;
}

interface EleveSuivi {
  nom: string;
  classe: string;
  absences: number;
  retards: number;
  motif: string;
  niveau: 'attention' | 'alerte';
}

interface EffectifCycle {
  cycle: string;
  effectif: number;
  pourcentage: number;
  classes: number;
}

interface PaiementPrioritaire {
  eleve: string;
  classe: string;
  montant: number;
  echeance: string;
  statut: 'EN RETARD' | 'À VENIR';
}

interface SuiviPedagogique {
  indicateur: string;
  valeur: string;
  detail: string;
  niveau: 'normal' | 'attention' | 'alerte';
}

interface EvenementDirection {
  jour: string;
  mois: string;
  titre: string;
  type: string;
  heure: string;
}

interface DashboardKpiElevesInscrits {
  nombreElevesInscrits: number;
  nombreReinscriptionsATraiter: number;
}

interface DashboardKpiPresence {
  nombreElevesInscrits: number;
  nombreElevesAppeles: number;
  nombreElevesPresents: number;
  nombreElevesAbsents: number;
  tauxPresence: number;
}

interface DashboardKpiEncaissement {
  montantAttendu: number;
  montantEncaisse: number;
  montantAEncaisser: number;
  montantEnRetard: number;
  tauxRecouvrement: number;
  paiementsPrioritaires: PaiementPrioritaire[];
}

interface DashboardKpiEvaluations {
  evaluationsACorriger: number;
  classesNecessitantSuivi: number;
}

interface DashboardEleveSuiviResponse {
  eleveId: number;
  nom: string;
  prenom: string;
  nombreAbsences: number;
  nombreRetards: number;
}

interface DashboardKpiPedagogie {
  tauxCahierTexte: number;
  classesPedagogiquesAverifier: number;
}

export interface ActiviteAdministrationResponse {
  date?: string;
  heureDebut?: string;
  titre?: string;
  type?: string;
}

@Component({
  selector: 'app-dashboard-administration-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-administration-component.html',
  styleUrl: './dashboard-administration-component.css',
})
export class DashboardAdministrationComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');

  etablissement = '';

  readonly anneeScolaire = '2026–2027';
  readonly dateDashboard = '24 octobre 2026';
  readonly dateSituation = this.getDateDuJour();

  readonly totalEleves = signal(0);
  readonly nombreReinscriptionsAtraiter = signal(0);

  readonly tauxPresence = signal(0);
  readonly absencesAujourdHui = signal(0);
  readonly retardsAujourdHui = signal(0);

  readonly tauxRecouvrement = signal(0);
  readonly montantAttendu = signal(0);
  readonly montantEncaisse = signal(0);
  readonly montantAencaisser = signal(0);
  readonly montantEnRetard = signal(0);

  readonly evaluationsACorriger = signal(0);

  readonly classesPedagogiquesAverifier = signal(0);
  readonly tauxCahierTexte = signal(0);

  readonly paiementsPrioritaires = signal<PaiementPrioritaire[]>([]);
  readonly elevesSuivi = signal<EleveSuivi[]>([]);
  readonly evenements = signal<ActiviteAVenir[]>([]);

  readonly totalEnseignants = 38;
  readonly totalClasses = 18;

  private getDateDuJour(): string {
    const date = new Date();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  readonly effectifsParCycle: EffectifCycle[] = [
    {
      cycle: 'Primaire',
      effectif: 230,
      pourcentage: 43.9,
      classes: 8,
    },
    {
      cycle: 'Collège',
      effectif: 174,
      pourcentage: 33.2,
      classes: 6,
    },
    {
      cycle: 'Lycée',
      effectif: 120,
      pourcentage: 22.9,
      classes: 4,
    },
  ];

  /*
  readonly evenements: EvenementDirection[] = [
    {
      jour: '27',
      mois: 'OCT',
      titre: 'Conseil pédagogique',
      type: 'Pédagogie',
      heure: '16:00',
    },
    {
      jour: '29',
      mois: 'OCT',
      titre: 'Réunion parents-professeurs',
      type: 'Vie scolaire',
      heure: '17:30',
    },
    {
      jour: '31',
      mois: 'OCT',
      titre: 'Évaluations du 1er trimestre',
      type: 'Évaluation',
      heure: '08:00',
    },
  ];
  */

  ngOnInit(): void {
    this.loadOrganizationInfos();
    this.loadDashboardData();
  }

  private loadOrganizationInfos(): void {
    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.toastService.warning('Attention', 'Organisation non trouvée');
      return;
    }
    this.organizationConfigService
      .getOrganizationConfigInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.organizationData = response;
          this.etablissement = response?.libelle ?? 'Non renseigné';
        },
        error: (error) => {
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
        },
      });
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      eleves: this.dashboardService.obtenirKpiElevesInscrits(),
      presence: this.dashboardService.obtenirKpiPresence(this.dateSituation),
      encaissement: this.dashboardService.rechercherKpiEncaissement(),
      evaluations: this.dashboardService.obtenirKpiEvaluations(),
      elevesSuivi: this.dashboardService.rechercherElevesNecessitantSuivi(),
      pedagogie: this.dashboardService.rechercherKpiPedagogie(),
      activites: this.dashboardService.afficherActiviteAVenirAdministration(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.totalEleves.set(data.eleves.nombreElevesInscrits);
          this.nombreReinscriptionsAtraiter.set(data.eleves.nombreReinscriptionsATraiter);
          this.tauxPresence.set(data.presence.tauxPresence);
          this.absencesAujourdHui.set(data.presence.nombreElevesAbsents);
          this.retardsAujourdHui.set(0);
          this.tauxRecouvrement.set(data.encaissement.tauxRecouvrement);
          this.montantAttendu.set(data.encaissement.montantAttendu);
          this.montantEncaisse.set(data.encaissement.montantEncaisse);
          this.montantAencaisser.set(data.encaissement.montantAEncaisser);
          this.montantEnRetard.set(data.encaissement.montantEnRetard);
          this.paiementsPrioritaires.set(data.encaissement.paiementsPrioritaires);
          this.evaluationsACorriger.set(data.evaluations.evaluationsACorriger);
          this.evenements.set(data.activites.map((activite) => this.mapperActiviteVersEvenement(activite)));

          this.elevesSuivi.set(
            data.elevesSuivi.map((eleve) => ({
              nom: `${eleve.prenom} ${eleve.nom}`.trim(),
              classe: '',
              absences: eleve.nombreAbsences,
              retards: eleve.nombreRetards,
              motif:
                eleve.nombreAbsences >= 2
                  ? 'Absences répétées'
                  : eleve.nombreRetards >= 2
                    ? 'Retards répétés'
                    : 'À surveiller',
              niveau:
                eleve.nombreAbsences >= 2 || eleve.nombreRetards >= 2
                  ? 'alerte'
                  : 'attention',
            }))
          );
          this.tauxCahierTexte.set(data.pedagogie.tauxCahierTexte);
          this.classesPedagogiquesAverifier.set(data.pedagogie.classesPedagogiquesAverifier);
          this.loading.set(false);
        },

        error: (error) => {
          console.error('Erreur chargement dashboard Direction:', error);
          this.error.set('Impossible de charger les données du dashboard');
          this.loading.set(false);
          this.toastService.error(
            'Erreur',
            'Impossible de charger les données du dashboard'
          );
        },
      });
  }

  private mapperActiviteVersEvenement(activite: ActiviteAdministrationResponse): ActiviteAVenir {

    const date = new Date(`${activite.date}T00:00:00`);

    return {
      jour: String(date.getDate()).padStart(2, '0'),
      mois: date
        .toLocaleDateString('fr-FR', { month: 'short' })
        .replace('.', '')
        .toUpperCase(),
      titre: activite.titre,
      type: activite.type,
      heure: activite.heureDebut?.substring(0, 5) ?? '',
    };
  }

  get kpis(): KpiDirection[] {

    return [
      {
        label: 'Élèves inscrits',
        valeur: this.formatNombre(this.totalEleves()),
        detail: `${this.nombreReinscriptionsAtraiter()} réinscriptions à traiter`,
        icon: '🎒',
        classe: 'bleu',
        action: () => this.ouvrirInscriptions(),
      },
      {
        label: 'Présence aujourd’hui',
        valeur: `${this.tauxPresence()}%`,
        detail: `${this.absencesAujourdHui()} absences · ` + `${this.retardsAujourdHui()} retards`,

        icon: '🟢',
        classe: 'vert',
        action: () => this.ouvrirAbsences(),
      },

      {
        label: 'Recouvrement scolarité',
        valeur: `${this.tauxRecouvrement()}%`,
        detail: `${this.formatMontant(this.montantAencaisser())} à encaisser`,
        icon: '💰',
        classe: 'orange',
        action: () => this.ouvrirFactures(),
      },

      {
        label: 'Évaluations à corriger',
        valeur: `${this.evaluationsACorriger()}`,
        detail: `${this.classesPedagogiquesAverifier()} classes nécessitent un suivi`,
        icon: '📚',
        classe: 'violet',
        action: () => this.ouvrirSuiviPedagogique(),
      },
    ];
  }

  get suiviPedagogique(): SuiviPedagogique[] {
    const taux = this.tauxCahierTexte();
    const evaluations = this.evaluationsACorriger();
    const classes = this.classesPedagogiquesAverifier();
    return [
      {
        indicateur: 'Cahier de texte renseigné',
        valeur: `${taux}%`,
        detail: 'des séances récentes sont renseignées',
        niveau:
          taux >= 80
            ? 'normal'
            : taux >= 60
              ? 'attention'
              : 'alerte',
      },

      {
        indicateur: 'Évaluations à corriger',
        valeur: `${evaluations}`,
        detail: 'évaluations attendent une correction',
        niveau: evaluations === 0 ? 'normal' : 'attention',
      },

      {
        indicateur: 'Classes à vérifier',
        valeur: `${classes}`,
        detail: 'absence de saisie récente du cahier de texte',
        niveau: classes === 0 ? 'normal' : 'alerte',
      },
    ];
  }

  ouvrirInscriptions(): void {
    void this.router.navigate(['/admin/dossier-eleve/inscription']);
  }

  ouvrirAbsences(): void {
    void this.router.navigate(['/admin/dossier-eleve/absences']);
  }

  ouvrirFactures(): void {
    void this.router.navigate(['/admin/comptabilite/facture']);
  }

  ouvrirSuiviPedagogique(): void {
    void this.router.navigate(['/admin/dossier-eleve/evaluations']);
  }

  ouvrirEvenements(): void {
    void this.router.navigate(['/admin/planification/evenement']);
  }

  nouvelleInscription(): void {
    void this.router.navigate(['/admin/dossier-eleve/inscrire-eleve']);
  }

  voirToutesLesReinscriptions(): void {
    void this.router.navigate(['/admin/dossier-eleve/inscription']);
  }

  formatNombre(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(valeur);
  }

  formatMontant(valeur: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(valeur)} FCFA`;
  }

  get largeurCycleMax(): number {
    return Math.max(...this.effectifsParCycle.map(cycle => cycle.effectif));
  }

  get largeurCycle(): number {
    return 0;
  }

  getBarWidth(effectif: number): string {
    const pourcentage =
      this.largeurCycleMax > 0
        ? (effectif / this.largeurCycleMax) * 100
        : 0;
    return `${pourcentage}%`;
  }
}