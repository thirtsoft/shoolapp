import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EleveRetard } from '../../../../core/models/statistique/eleve-retard';
import { FactureStatut } from '../../../../core/models/statistique/facture-statut';
import { QuatreDernierEvenement } from '../../../../core/models/statistique/quatre-derniers-evenement';
import { SexeRepartition } from '../../../../core/models/statistique/sexe-repartition';
import { DashboardStats } from '../../../../core/models/statistique/stats-globales';
import { DashboardStatsList } from '../../../../core/models/statistique/stats-globales-list';
import { DataService } from '../../../../shared/data.service';
import { DashboardService } from '../../dossier-eleve/service/dashboard.service';

@Component({
  selector: 'app-dashboard-administration-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-administration-component.html',
  styleUrl: './dashboard-administration-component.css',
})
export class DashboardAdministrationComponent implements OnInit {

  ds = inject(DataService);

  nombreTotalEleve?: number = 0;
  nombreTotalEnseignant?: number = 0;
  nombreTotalEleveInscrits?: number = 0;
  nombreTotalEleveNonInscrits?: number = 0;
  nombreTotalClasse?: number = 0;
  nombreTotalFactureImpayees: number = 0;
  montantTotalimpaye: number = 0;
  montantTotalEnAttent: number = 0;
  montantTotalEnRetard: number = 0;

  elevesRetards?: EleveRetard[] = [];
  paiementsEnAttente?: FactureStatut[] = [];
  evenements?: QuatreDernierEvenement[] = [];
  repartitionSexe?: SexeRepartition[] = [];
  dashboardStats: DashboardStats = {};

  kpis: any[] = [];
  dashboardStatsList: DashboardStatsList = {};
  private fallbackEleveEnRetards: any[] = [];
  private fallbackRepartitionsParSexe: any[] = [];
  private fallbackPaiements: any[] = [];
  private fallbackEvenements: any[] = [];

  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.chargerLesDonnees();
    this.initKpisParDefaut();
    this.initLesListeDashboardParDefaut();
  }

  private initKpisParDefaut() {
    this.kpis = [
      { label: 'Élèves inscrits', val: '-', ico: '🎒', var: 0, detail: '- en attente', cls: 'bleu' },
      { label: 'Paiements en attente', val: '-', ico: '⏳', var: 0, detail: 'Délais non dépassés', cls: 'vert' },
      { label: 'Paiements en retard', val: '-', ico: '🚨', var: 0, detail: 'Échéances dépassées', cls: 'or' },
      { label: 'Factures impayées', val: '-', ico: '💰', var: 0, detail: '- factures au total', cls: 'rouge' }
    ];
  }

  private initLesListeDashboardParDefaut() {
    this.fallbackEleveEnRetards = [
      { nom: 'Moussa Diop', classe: 'Terminale S2', retards: 8, absences: 3 },
      { nom: 'Fatou Sow', classe: 'Première L1', retards: 6, absences: 5 },
      { nom: 'Ibrahima Fall', classe: 'Troisième A', retards: 12, absences: 2 },
      { nom: 'Aïssatou Bah', classe: 'Seconde S1', retards: 4, absences: 7 },
      { nom: 'Omar Ndiaye', classe: 'CM2 B', retards: 9, absences: 1 },
    ];

    this.fallbackPaiements = [
      { eleve: 'Moussa Diop', parent: 'M. Diop', montant: 250000, echeance: '15/03/2026', statut: 'En retard' },
      { eleve: 'Fatou Sow', parent: 'Mme Sow', montant: 180000, echeance: '20/03/2026', statut: 'En attente' },
      { eleve: 'Ibrahima Fall', parent: 'M. Fall', montant: 320000, echeance: '05/03/2026', statut: 'En retard' },
      { eleve: 'Aïssatou Bah', parent: 'Mme Bah', montant: 150000, echeance: '25/03/2026', statut: 'En attente' },
    ];

    this.fallbackEvenements = [
      { libelle: 'Conseil de classe - Terminale', date: '10 Mars 2026', description: 'conseil' },
      { libelle: 'Réunion parents-professeurs', date: '15 Mars 2026', description: 'reunion' },
      { libelle: 'Épreuves du BAC blanc', date: '20-24 Mars 2026', description: 'examen' },
      { libelle: 'Journée sportive', date: '28 Mars 2026', description: 'sport' },
    ];

    this.fallbackRepartitionsParSexe = [
      { label: 'Primaire', effectif: 450, couleur: '#4299e1' },
      { label: 'Collège', effectif: 380, couleur: '#2c5282' },
      { label: 'Lycée', effectif: 370, couleur: '#1e3a5f' },
    ];
    this.elevesRetards = this.fallbackEleveEnRetards;
    this.repartitionSexe = this.fallbackRepartitionsParSexe;
    this.paiementsEnAttente = this.fallbackPaiements;
    this.evenements = this.fallbackEvenements;
  }

  private chargerLesDonnees() {
    this.dashboardService.afficherLesStatsGlobales().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.dashboardStats = data;
        this.nombreTotalEleve = this.dashboardStats.nombreEleves;
        this.nombreTotalEnseignant = this.dashboardStats.nombreEnseignant;
        this.nombreTotalEleveNonInscrits = this.dashboardStats.nombreEleveNonInscrits;
        this.nombreTotalClasse = this.dashboardStats.nombreClasse;

        this.mettreAJourKpis(data);
      }
    });

    this.dashboardService.afficherLesListDeStatsGlobales().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.dashboardStatsList = data;
        this.mettreAJourLesListe(data);
      }
    });
  }

  private mettreAJourKpis(stats: DashboardStats) {
    this.kpis = [
      {
        label: 'Élèves inscrits',
        val: this.formatNombre(stats.nombreEleveInscrits ?? 0),
        ico: '🎒',
        var: +8,
        detail: `${this.formatNombre(stats.nombreEleveNonInscrits ?? 0)} en attente`,
        cls: 'bleu'
      },
      {
        label: 'Paiements en attente',
        val: this.formatFCFA(stats.montantTotalEnAttante ?? 0),
        ico: '⏳',
        var: 0,
        detail: 'À encaisser prochainement',
        cls: 'vert'
      },
      {
        label: 'Paiements en retard',
        val: this.formatFCFA(stats.montantTotalEnRetard ?? 0),
        ico: '🚨',
        var: +4.2,
        detail: 'Créances à relancer',
        cls: 'or'
      },
      {
        label: 'Factures impayées',
        val: this.formatFCFA(stats.montantTotalImpaye ?? 0),
        ico: '💰',
        var: -5,
        detail: `${stats.nombreTotalFactureImpaye ?? 0} factures non soldées`,
        cls: 'rouge'
      }
    ];
  }

  private mettreAJourLesListe(stats: DashboardStatsList) {
    this.paiementsEnAttente = (stats.factureStatutDTOList && stats.factureStatutDTOList.length > 0)
      ? stats.factureStatutDTOList
      : this.fallbackPaiements;

    this.evenements = (stats.quatreDernierEvenementDTOList && stats.quatreDernierEvenementDTOList.length > 0)
      ? stats.quatreDernierEvenementDTOList
      : this.fallbackEvenements;

    this.elevesRetards = (stats.eleveRetardDTOList && stats.eleveRetardDTOList.length > 0)
      ? stats.eleveRetardDTOList
      : this.fallbackEleveEnRetards;

    this.repartitionSexe = (stats.sexeRepartitionDTOList && stats.sexeRepartitionDTOList.length > 0)
      ? stats.sexeRepartitionDTOList
      : this.fallbackRepartitionsParSexe;
  }

  // ── Méthodes utilitaires ─────────────────────────────
  getStatutClasse(cls: string): string {
    if (cls.includes('En retard')) return 'danger';
    if (cls.includes('En attente')) return 'warning';
    return 'success';
  }

  getEvenementIcone(type: string): string {
    const icones: Record<string, string> = {
      conseil: '👥',
      reunion: '👪',
      examen: '📝',
      sport: '⚽',
    };
    return icones[type] ?? '📅';
  }

  voirInscriptions(): void {
    this.router.navigate(['/admin/dossier-eleve/inscriptions']);
  }

  voirAbsenceEleves(): void {
    this.router.navigate(['/admin/dossier-eleve/absences']);
  }

  voirFactures(): void {
    this.router.navigate(['/admin/comptabilite/facture']);
  }

  voirEvenements(): void {
    this.router.navigate(['/admin/planification/evenement']);
  }

  formatNombre(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  formatFCFA(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

}


