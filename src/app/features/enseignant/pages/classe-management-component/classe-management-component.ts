import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
// ─── Interfaces ───────────────────────────────────────
export interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  absent?: boolean;
  motif?: string;
}

export interface Evaluation {
  id: string;
  titre: string;
  type: 'Contrôle' | 'DM' | 'TP' | 'Examen';
  date: string;
  coefficient: number;
  noteMax: number;
  statut: 'En attente' | 'Corrigée' | 'Publiée';
}

export interface Exercice {
  id: string;
  titre: string;
  type: 'Contrôle' | 'DM' | 'TP' | 'Examen';
  date: string;
  coefficient: number;
  noteMax: number;
  statut: 'En attente' | 'Corrigée' | 'Publiée';
}

export interface NoteEleve {
  eleveId: string;
  nom: string;
  prenom: string;
  evaluations: {
    [evaluationId: string]: number | null;
  };
  moyenne: number;
  appreciation?: string;
}

export interface Bulletin {
  eleveId: string;
  nom: string;
  prenom: string;
  moyenne: number;
  rang: number;
  appreciation: string;
  decision: 'Admis' | 'Redouble' | 'Avertissement' | 'Encouragement';
}


@Component({
  selector: 'app-classe-management-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './classe-management-component.html',
  styleUrl: './classe-management-component.css',
})
export class ClasseManagementComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  // ─── Contexte (vient des query params) ──────────────
  matiere = signal<string>('Mathématiques');
  classe = signal<string>('5ème A');
  anneeScolaire = signal<string>('2025-2026');

  // ─── Onglets actif ──────────────────────────────────
  activeTab = signal<string>('appel');

  // ─── Données de démo ────────────────────────────────
  eleves = signal<Eleve[]>([]);
  evaluations = signal<Evaluation[]>([]);
  notes = signal<NoteEleve[]>([]);
  bulletins = signal<Bulletin[]>([]);
  exercices = signal<Exercice[]>([]);

  ngOnInit(): void {
    // Récupération du contexte via query params
    this.route.queryParams.subscribe(params => {
      if (params['matiere']) this.matiere.set(params['matiere']);
      if (params['classe']) this.classe.set(params['classe']);
      if (params['annee']) this.anneeScolaire.set(params['annee']);
    });

    this.chargerDonnees();
  }

  chargerDonnees(): void {
    // ─── Données simulées (remplacer par vos appels API) ───
    this.eleves.set([
      { id: '1', nom: 'Dupont', prenom: 'Marie', sexe: 'F', absent: true, motif: 'Maladie' },
      { id: '2', nom: 'Martin', prenom: 'Lucas', sexe: 'M', absent: false },
      { id: '3', nom: 'Bernard', prenom: 'Chloé', sexe: 'F', absent: false },
      { id: '4', nom: 'Petit', prenom: 'Thomas', sexe: 'M', absent: true, motif: 'Absence non justifiée' },
      { id: '5', nom: 'Robert', prenom: 'Emma', sexe: 'F', absent: false },
      { id: '6', nom: 'Richard', prenom: 'Hugo', sexe: 'M', absent: false },
      { id: '7', nom: 'Durand', prenom: 'Léa', sexe: 'F', absent: false },
      { id: '8', nom: 'Moreau', prenom: 'Nathan', sexe: 'M', absent: true, motif: 'Retard' },
    ]);

    this.evaluations.set([
      { id: 'e1', titre: 'Contrôle - Théorème de Pythagore', type: 'Contrôle', date: '2026-05-20', coefficient: 4, noteMax: 20, statut: 'En attente' },
      { id: 'e2', titre: 'DM - Exercices réciproques', type: 'DM', date: '2026-05-10', coefficient: 2, noteMax: 20, statut: 'Corrigée' },
      { id: 'e3', titre: 'TP - Géométrie appliquée', type: 'TP', date: '2026-05-25', coefficient: 2, noteMax: 20, statut: 'En attente' },
      { id: 'e4', titre: 'Examen Blanc Trimestre 3', type: 'Examen', date: '2026-06-01', coefficient: 6, noteMax: 40, statut: 'En attente' },
    ]);

    this.exercices.set([
      { id: 'e1', titre: 'Contrôle - Théorème de Pythagore', type: 'Contrôle', date: '2026-05-20', coefficient: 4, noteMax: 20, statut: 'En attente' },
      { id: 'e2', titre: 'DM - Exercices réciproques', type: 'DM', date: '2026-05-10', coefficient: 2, noteMax: 20, statut: 'Corrigée' },
      { id: 'e3', titre: 'TP - Géométrie appliquée', type: 'TP', date: '2026-05-25', coefficient: 2, noteMax: 20, statut: 'En attente' },
      { id: 'e4', titre: 'Examen Blanc Trimestre 3', type: 'Examen', date: '2026-06-01', coefficient: 6, noteMax: 40, statut: 'En attente' },
    ]);

    this.notes.set([
      {
        eleveId: '1', nom: 'Dupont', prenom: 'Marie',
        evaluations: { 'e1': 15, 'e2': 12, 'e3': null, 'e4': null },
        moyenne: 13.5, appreciation: 'Bon travail, continuez'
      },
      {
        eleveId: '2', nom: 'Martin', prenom: 'Lucas',
        evaluations: { 'e1': 8, 'e2': 10, 'e3': null, 'e4': null },
        moyenne: 9, appreciation: 'Peut mieux faire'
      },
      {
        eleveId: '3', nom: 'Bernard', prenom: 'Chloé',
        evaluations: { 'e1': 18, 'e2': 17, 'e3': null, 'e4': null },
        moyenne: 17.5, appreciation: 'Excellent !'
      },
      {
        eleveId: '4', nom: 'Petit', prenom: 'Thomas',
        evaluations: { 'e1': 5, 'e2': 6, 'e3': null, 'e4': null },
        moyenne: 5.5, appreciation: 'En difficulté, nécessite un suivi'
      },
      {
        eleveId: '5', nom: 'Robert', prenom: 'Emma',
        evaluations: { 'e1': 14, 'e2': 15, 'e3': null, 'e4': null },
        moyenne: 14.5, appreciation: 'Très bien'
      },
      {
        eleveId: '6', nom: 'Richard', prenom: 'Hugo',
        evaluations: { 'e1': 11, 'e2': 9, 'e3': null, 'e4': null },
        moyenne: 10, appreciation: 'Ensemble correct'
      },
      {
        eleveId: '7', nom: 'Durand', prenom: 'Léa',
        evaluations: { 'e1': 16, 'e2': 14, 'e3': null, 'e4': null },
        moyenne: 15, appreciation: 'Très bon trimestre'
      },
      {
        eleveId: '8', nom: 'Moreau', prenom: 'Nathan',
        evaluations: { 'e1': 7, 'e2': 8, 'e3': null, 'e4': null },
        moyenne: 7.5, appreciation: 'Doit fournir plus d\'efforts'
      },
    ]);

    this.bulletins.set([
      { eleveId: '1', nom: 'Dupont', prenom: 'Marie', moyenne: 13.5, rang: 4, appreciation: 'Bon trimestre. Continue à participer en classe.', decision: 'Admis' },
      { eleveId: '2', nom: 'Martin', prenom: 'Lucas', moyenne: 9, rang: 7, appreciation: 'Résultats insuffisants. Baisse de concentration constatée.', decision: 'Avertissement' },
      { eleveId: '3', nom: 'Bernard', prenom: 'Chloé', moyenne: 17.5, rang: 1, appreciation: 'Excellent trimestre. Félicitations pour ton investissement !', decision: 'Encouragement' },
      { eleveId: '4', nom: 'Petit', prenom: 'Thomas', moyenne: 5.5, rang: 8, appreciation: 'Très grandes difficultés. Un redoublement est envisagé.', decision: 'Redouble' },
      { eleveId: '5', nom: 'Robert', prenom: 'Emma', moyenne: 14.5, rang: 3, appreciation: 'Très bon trimestre, progrès constants.', decision: 'Admis' },
      { eleveId: '6', nom: 'Richard', prenom: 'Hugo', moyenne: 10, rang: 6, appreciation: 'Trimestre correct, mais peut mieux faire en s\'investissant davantage.', decision: 'Admis' },
      { eleveId: '7', nom: 'Durand', prenom: 'Léa', moyenne: 15, rang: 2, appreciation: 'Très bon travail, continue ainsi !', decision: 'Admis' },
      { eleveId: '8', nom: 'Moreau', prenom: 'Nathan', moyenne: 7.5, rang: 5, appreciation: 'Trop d\'absences. Les résultats s\'en ressentent.', decision: 'Avertissement' },
    ]);
  }

  // ─── Changement d'onglet ─────────────────────────────
  changerOnglet(onglet: string): void {
    this.activeTab.set(onglet);
  }

  // ─── Calculs pour l'appel ────────────────────────────
  get totalAbsents(): number {
    return this.eleves().filter(e => e.absent).length;
  }

  get totalPresents(): number {
    return this.eleves().filter(e => !e.absent).length;
  }

  // ─── Calculs pour les évaluations ────────────────────
  get totalEvaluations(): number {
    return this.evaluations().length;
  }

  get evaluationsEnAttente(): number {
    return this.evaluations().filter(e => e.statut === 'En attente').length;
  }

  // ─── Calculs pour les notes ──────────────────────────
  get moyenneClasse(): number {
    const notes = this.notes();
    if (notes.length === 0) return 0;
    const somme = notes.reduce((acc, n) => acc + n.moyenne, 0);
    return parseFloat((somme / notes.length).toFixed(2));
  }

  get noteMaximale(): number {
    const notes = this.notes();
    if (notes.length === 0) return 0;
    return Math.max(...notes.map(n => n.moyenne));
  }

  get noteMinimale(): number {
    const notes = this.notes();
    if (notes.length === 0) return 0;
    return Math.min(...notes.map(n => n.moyenne));
  }

  // ─── Sauvegarde (simulation) ─────────────────────────
  sauvegarderAppel(): void {
    alert('Appel sauvegardé avec succès !');
  }

  creerExercice(): void {
    alert('Redirection vers le formulaire de création d\'exercices...');
  }

  creerEvaluation(): void {
    alert('Redirection vers le formulaire de création d\'évaluation...');
  }

  sauvegarderNotes(): void {
    alert('Notes sauvegardées avec succès !');
  }

  genererBulletins(): void {
    alert('Génération des bulletins en cours...');
  }

  today(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    };
    return new Date().toLocaleDateString('fr-FR', options);
  }
}
