import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../shared/data.service';

interface EleveRetard {
  nom: string;
  classe: string;
  retards: number;
  absences: number;
}

interface PaiementEnAttente {
  eleve: string;
  parent: string;
  montant: number;
  echeance: string;
  statut: string;
}

interface Evenement {
  titre: string;
  date: string;
  type: string;
}

@Component({
  selector: 'app-dashboard-gerant-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-gerant-component.html',
  styleUrl: './dashboard-gerant-component.css',
})
export class DashboardGerantComponent {

  ds = inject(DataService);
  private readonly router = inject(Router);

  // ── Données simulées pour la démo ──────────────────────
  inscriptionsEnAttente = 24;
  totalEleves = 1200;
  totalEnseignants = 85;
  totalClasses = 32;
  facturesImpayees = 156;
  montantImpayes = 45850000;
  tauxReussite = 92;
  presenceMoyenne = 94;

  // ── KPIs ──────────────────────────────────────────────
  kpis = [
    {
      label: 'Élèves inscrits',
      val: this.formatNombre(this.totalEleves),
      ico: '🎒',
      var: +8,
      detail: `${this.inscriptionsEnAttente} en attente`,
      cls: 'bleu'
    },
    {
      label: 'Taux de réussite',
      val: `${this.tauxReussite}%`,
      ico: '🏆',
      var: +3,
      detail: 'Baccalauréat 2026',
      cls: 'vert'
    },
    {
      label: 'Présence moyenne',
      val: `${this.presenceMoyenne}%`,
      ico: '📋',
      var: +1.5,
      detail: 'Ce mois',
      cls: 'or'
    },
    {
      label: 'Factures impayées',
      val: this.formatFCFA(this.montantImpayes),
      ico: '💰',
      var: -5,
      detail: `${this.facturesImpayees} factures`,
      cls: 'rouge'
    },
  ];

  // ── Élèves avec retards/absences ──────────────────────
  elevesRetards: EleveRetard[] = [
    { nom: 'Moussa Diop', classe: 'Terminale S2', retards: 8, absences: 3 },
    { nom: 'Fatou Sow', classe: 'Première L1', retards: 6, absences: 5 },
    { nom: 'Ibrahima Fall', classe: 'Troisième A', retards: 12, absences: 2 },
    { nom: 'Aïssatou Bah', classe: 'Seconde S1', retards: 4, absences: 7 },
    { nom: 'Omar Ndiaye', classe: 'CM2 B', retards: 9, absences: 1 },
  ];

  // ── Paiements en attente ─────────────────────────────
  paiementsEnAttente: PaiementEnAttente[] = [
    { eleve: 'Moussa Diop', parent: 'M. Diop', montant: 250000, echeance: '15/03/2026', statut: 'En retard' },
    { eleve: 'Fatou Sow', parent: 'Mme Sow', montant: 180000, echeance: '20/03/2026', statut: 'En attente' },
    { eleve: 'Ibrahima Fall', parent: 'M. Fall', montant: 320000, echeance: '05/03/2026', statut: 'En retard' },
    { eleve: 'Aïssatou Bah', parent: 'Mme Bah', montant: 150000, echeance: '25/03/2026', statut: 'En attente' },
  ];

  // ── Événements à venir ──────────────────────────────
  evenements: Evenement[] = [
    { titre: 'Conseil de classe - Terminale', date: '10 Mars 2026', type: 'conseil' },
    { titre: 'Réunion parents-professeurs', date: '15 Mars 2026', type: 'reunion' },
    { titre: 'Épreuves du BAC blanc', date: '20-24 Mars 2026', type: 'examen' },
    { titre: 'Journée sportive', date: '28 Mars 2026', type: 'sport' },
  ];

  // ── Répartition élèves par niveau ─────────────────────
  repartitionNiveaux = [
    { niveau: 'Primaire', effectif: 450, couleur: '#4299e1' },
    { niveau: 'Collège', effectif: 380, couleur: '#2c5282' },
    { niveau: 'Lycée', effectif: 370, couleur: '#1e3a5f' },
  ];

  maxEffectif(): number {
    return Math.max(...this.repartitionNiveaux.map(n => n.effectif));
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
    this.router.navigate(['/administration/inscriptions']);
  }

  voirEleves(): void {
    this.router.navigate(['/administration/eleves']);
  }

  voirFactures(): void {
    this.router.navigate(['/administration/factures']);
  }

  formatNombre(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  formatFCFA(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

}

