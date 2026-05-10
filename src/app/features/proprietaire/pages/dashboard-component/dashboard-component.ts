import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

interface ClasseProfesseur {
  id: number;
  nom: string;
  niveau: string;
  effectif: number;
  moyenne: number;
  prochainCours: string;
  nbElevesRetard: number;
}

interface CoursJour {
  heure: string;
  classe: string;
  matiere: string;
  salle: string;
  duree: string;
  statut: 'termine' | 'en_cours' | 'a_venir';
}

interface NoteARemplir {
  classe: string;
  evaluation: string;
  date: string;
  nbNotes: number;
  nbEleves: number;
  progression: number;
}

interface EleveRemarquable {
  nom: string;
  classe: string;
  note: number;
  type: 'excellent' | 'difficulte' | 'progres';
}

interface MessageProfesseur {
  id: string;
  expediteur: string;
  role: string;
  sujet: string;
  date: string;
  nonLu: boolean;
}

interface AbsenceClasse {
  classe: string;
  nbAbsents: number;
  nbEleves: number;
  date: string;
}

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent {

  private readonly router = inject(Router);

  // ── Informations professeur ────────────────────────
  professeur = signal({
    nom: 'M. Sall',
    matiere: 'Mathématiques',
    avatar: '👨‍🏫'
  });

  // ── KPIs principaux ────────────────────────────────
  kpis = signal([
    { label: 'Mes classes', val: '3', ico: '🏫', detail: '120 élèves', couleur: 'bleu' },
    { label: 'Moyenne générale', val: '13.8/20', ico: '📊', detail: 'Toutes classes', couleur: 'vert' },
    { label: 'Cours aujourd\'hui', val: '4', ico: '🕐', detail: '8h de cours', couleur: 'or' },
    { label: 'Notes à saisir', val: '28', ico: '📝', detail: '3 évaluations', couleur: 'rouge' },
  ]);

  // ── Emploi du temps du jour ────────────────────────
  edtJour = signal<CoursJour[]>([
    { heure: '08:00 - 10:00', classe: 'Terminale S2', matiere: 'Mathématiques', salle: 'Salle 12', duree: '2h', statut: 'termine' },
    { heure: '10:15 - 12:15', classe: 'Première S1', matiere: 'Mathématiques', salle: 'Salle 8', duree: '2h', statut: 'en_cours' },
    { heure: '14:00 - 16:00', classe: 'Seconde S2', matiere: 'Mathématiques', salle: 'Salle 5', duree: '2h', statut: 'a_venir' },
    { heure: '16:00 - 18:00', classe: 'Terminale S2', matiere: 'Soutien', salle: 'Salle 12', duree: '2h', statut: 'a_venir' },
  ]);

  // ── Mes classes ────────────────────────────────────
  classes = signal<ClasseProfesseur[]>([
    { id: 1, nom: 'Terminale S2', niveau: 'Terminale', effectif: 38, moyenne: 14.5, prochainCours: 'Auj. 16:00', nbElevesRetard: 3 },
    { id: 2, nom: 'Première S1', niveau: 'Première', effectif: 42, moyenne: 12.8, prochainCours: 'Demain 08:00', nbElevesRetard: 5 },
    { id: 3, nom: 'Seconde S2', niveau: 'Seconde', effectif: 40, moyenne: 13.2, prochainCours: 'Auj. 14:00', nbElevesRetard: 2 },
  ]);

  // ── Notes à remplir ────────────────────────────────
  notesARemplir = signal<NoteARemplir[]>([
    { classe: 'Terminale S2', evaluation: 'DS n°4 - Fonctions', date: '15 Mars', nbNotes: 12, nbEleves: 38, progression: 32 },
    { classe: 'Première S1', evaluation: 'Interro - Dérivées', date: '12 Mars', nbNotes: 8, nbEleves: 42, progression: 19 },
    { classe: 'Seconde S2', evaluation: 'DM - Géométrie', date: '10 Mars', nbNotes: 8, nbEleves: 40, progression: 20 },
  ]);

  // ── Élèves remarquables ────────────────────────────
  elevesRemarquables = signal<EleveRemarquable[]>([
    { nom: 'Moussa Diop', classe: 'Tle S2', note: 18.5, type: 'excellent' },
    { nom: 'Fatou Sow', classe: '1ère S1', note: 7.5, type: 'difficulte' },
    { nom: 'Ibrahima Fall', classe: '2nde S2', note: 14, type: 'progres' },
    { nom: 'Aïssatou Bah', classe: 'Tle S2', note: 17, type: 'excellent' },
  ]);

  // ── Absences du jour ───────────────────────────────
  absencesJour = signal<AbsenceClasse[]>([
    { classe: 'Terminale S2', nbAbsents: 2, nbEleves: 38, date: 'Aujourd\'hui' },
    { classe: 'Première S1', nbAbsents: 4, nbEleves: 42, date: 'Aujourd\'hui' },
    { classe: 'Seconde S2', nbAbsents: 1, nbEleves: 40, date: 'Aujourd\'hui' },
  ]);

  // ── Messages récents ───────────────────────────────
  messages = signal<MessageProfesseur[]>([
    { id: '1', expediteur: 'Mme Diop', role: 'Administration', sujet: 'Conseil de classe - Planning', date: '15 Mars', nonLu: true },
    { id: '2', expediteur: 'M. Ndiaye', role: 'Prof. SVT', sujet: 'Projet interdisciplinaire', date: '14 Mars', nonLu: true },
    { id: '3', expediteur: 'Parent élève', role: 'M. Diallo', sujet: 'Suivi de Moussa Diop', date: '12 Mars', nonLu: false },
  ]);

  messagesNonLus = computed(() => this.messages().filter(m => m.nonLu).length);

  // ── Méthodes ───────────────────────────────────────
  getStatutCoursCls(statut: string): string {
    const classes: Record<string, string> = {
      termine: 'termine',
      en_cours: 'en-cours',
      a_venir: 'a-venir'
    };
    return classes[statut] || '';
  }

  getStatutCoursLabel(statut: string): string {
    const labels: Record<string, string> = {
      termine: 'Terminé',
      en_cours: 'En cours',
      a_venir: 'À venir'
    };
    return labels[statut] || statut;
  }

  getTypeEleveCls(type: string): string {
    const classes: Record<string, string> = {
      excellent: 'excellent',
      difficulte: 'difficulte',
      progres: 'progres'
    };
    return classes[type] || '';
  }

  getTypeEleveLabel(type: string): string {
    const labels: Record<string, string> = {
      excellent: '🌟 Excellent',
      difficulte: '⚠️ Difficulté',
      progres: '📈 Progrès'
    };
    return labels[type] || type;
  }

  getTypeEleveIcone(type: string): string {
    const icones: Record<string, string> = {
      excellent: '🌟',
      difficulte: '⚠️',
      progres: '📈'
    };
    return icones[type] || '📌';
  }

  formatPourcentage(nb: number, total: number): number {
    return Math.round((nb / total) * 100);
  }

  naviguer(route: string): void {
    this.router.navigate([route]);
  }
}