import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

interface Absence {
  id?: number;
  eleveId: string;
  eleveNom: string;
  elevePrenom: string;
  dateAbsence: string;
  semestre: number;
  anneeScolaire: string;
  justifiee: boolean;  // Statut: true = justifiée, false = non justifiée
  motif: string;
  typeSignalement: string; // 'ENSEIGNANT'
  createur: number; // ID de l'enseignant
}

interface EvaluationForm {
  titre: string;
  type: string;
  mode: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  description: string;
  fichier: File | null;
}

interface ExerciceForm {
  titre: string;
  livreChoisi: string;
  numeroExercice: string;
  lien: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  pieceJointe: File | null;
}

@Component({
  selector: 'app-classe-management-component',
  standalone: true,
  imports: [RouterModule, FormsModule, DatePipe],
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

  // Dans le composant
  showAbsenceFormModal = signal<boolean>(false);
  currentEleveForAbsence: Eleve | null = null;

  absenceForm = {
    dateAbsence: new Date().toISOString().split('T')[0],
    semestre: 1,
    anneeScolaire: this.anneeScolaire(),
    justifiee: true,
    motif: '',
    typeSignalement: 'ENSEIGNANT'
  };

  // Dans le composant
  showEvaluationModal = signal<boolean>(false);
  evaluationForm: EvaluationForm = {
    titre: '',
    type: '',
    mode: '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    description: '',
    fichier: null,
  };

  typesEvaluation: string[] = ['DEVOIR', 'COMPOSITION', 'TP', 'EXAMEN'];
  modesEvaluation: string[] = ['NORMAL', 'RATTRAPAGE'];

  livresProgramme: string[] = [
    'Mathématiques 3ème - Collection Sirius',
    'Mathématiques 3ème - Transmath',
    'Mathématiques 3ème - Phare',
    'Mathématiques 3ème - Dimathème',
    'Physique Chimie 3ème - Collection Euclide',
    'Physique Chimie 3ème - Collection Espace',
    'Français 3ème - Fleurs d\'encre',
    'Français 3ème - Terres Littéraires',
    'Anglais 3ème - Join the Team',
    'Anglais 3ème - New Live',
    'Histoire-Géographie 3ème - Hatier',
    'Histoire-Géographie 3ème - Nathan',
    'SVT 3ème - Collection Lizeaux',
    'SVT 3ème - Collection Escalier'
  ];

  // Dans le composant
  showExerciceModal = signal<boolean>(false);
  exerciceForm: ExerciceForm = {
    titre: '',
    livreChoisi: '',
    numeroExercice: '',
    lien: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    description: '',
    pieceJointe: null
  };

  // Ajouter dans le composant
  selectedEvaluationForNotes: any = null;
  currentNotesData: NoteEleve[] = [];

  ngOnInit(): void {
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
  ouvrirFormulaireAbsence(eleve: Eleve) {
    this.currentEleveForAbsence = eleve;
    this.showAbsenceFormModal.set(true);
  }

  sauvegarderAbsence() {
    if (!this.absenceForm.motif.trim()) {
      alert('Veuillez saisir un motif');
      return;
    }

    const absence: Absence = {
      eleveId: this.currentEleveForAbsence!.id,
      eleveNom: this.currentEleveForAbsence!.nom,
      elevePrenom: this.currentEleveForAbsence!.prenom,
      dateAbsence: this.absenceForm.dateAbsence,
      semestre: this.absenceForm.semestre,
      anneeScolaire: this.absenceForm.anneeScolaire,
      justifiee: this.absenceForm.justifiee,
      motif: this.absenceForm.motif,
      typeSignalement: 'ENSEIGNANT',
      createur: 1 // ID de l'enseignant connecté
    };

    console.log('Absence enregistrée:', absence);
    alert(`Absence enregistrée pour ${this.currentEleveForAbsence!.prenom} ${this.currentEleveForAbsence!.nom}`);

    // Marquer l'élève comme absent dans la liste
    const eleve = this.eleves().find(e => e.id === this.currentEleveForAbsence!.id);
    if (eleve) {
      eleve.absent = true;
      eleve.motif = this.absenceForm.motif;
    }

    this.fermerFormulaireAbsence();
  }

  fermerFormulaireAbsence() {
    this.showAbsenceFormModal.set(false);
    this.currentEleveForAbsence = null;
    this.absenceForm = {
      dateAbsence: new Date().toISOString().split('T')[0],
      semestre: 1,
      anneeScolaire: this.anneeScolaire(),
      justifiee: true,
      motif: '',
      typeSignalement: 'ENSEIGNANT'
    };
  }

  sauvegarderAppel(): void {
    const absences = this.eleves().filter(e => e.absent);
    if (absences.length === 0) {
      alert('Aucune absence enregistrée');
      return;
    }
    alert(`Appel sauvegardé ! ${absences.length} absence(s) enregistrée(s)`);
  }

  // Ouvrir le popup de création d'exercice
  creerExercice(): void {
    this.showExerciceModal.set(true);
  }

  // Fermer le popup
  fermerExerciceModal() {
    this.showExerciceModal.set(false);
    this.resetExerciceForm();
  }

  // Réinitialiser le formulaire
  resetExerciceForm() {
    this.exerciceForm = {
      titre: '',
      livreChoisi: '',
      numeroExercice: '',
      lien: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0],
      description: '',
      pieceJointe: null
    };
  }

  // Gérer l'upload de pièce jointe
  onPieceJointeSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        this.exerciceForm.pieceJointe = file;
      } else {
        alert('Format de fichier non autorisé. Utilisez PDF, Image ou Document Word.');
      }
    }
  }

  // Supprimer la pièce jointe
  supprimerPieceJointe() {
    this.exerciceForm.pieceJointe = null;
    const fileInput = document.getElementById('pieceJointeExercice') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Sauvegarder l'exercice
  sauvegarderExercice() {
    // Vérifier les champs obligatoires
    if (!this.exerciceForm.titre.trim()) {
      alert('Veuillez saisir un titre');
      return;
    }
    if (!this.exerciceForm.dateDebut) {
      alert('Veuillez sélectionner une date de début');
      return;
    }
    if (!this.exerciceForm.dateFin) {
      alert('Veuillez sélectionner une date de fin');
      return;
    }

    // Création de l'objet exercice
    const nouvelExercice = {
      id: Date.now().toString(),
      titre: this.exerciceForm.titre,
      type: this.exerciceForm.livreChoisi ? 'Livre' : 'Exercice',
      date: this.exerciceForm.dateDebut,
      coefficient: 1,
      noteMax: 20,
      statut: 'En attente',
      livreChoisi: this.exerciceForm.livreChoisi,
      numeroExercice: this.exerciceForm.numeroExercice,
      lien: this.exerciceForm.lien,
      dateDebut: this.exerciceForm.dateDebut,
      dateFin: this.exerciceForm.dateFin,
      description: this.exerciceForm.description,
      pieceJointe: this.exerciceForm.pieceJointe?.name || null
    };

    // Ajouter à la liste des exercices
    //  this.exercices.update(prev => [...prev, nouvelExercice]);

    if (this.exerciceForm.pieceJointe) {
      console.log('Pièce jointe:', this.exerciceForm.pieceJointe.name);
    }

    alert(`Exercice "${this.exerciceForm.titre}" créé avec succès !`);
    this.fermerExerciceModal();
  }

  creerEvaluation(): void {
    this.showEvaluationModal.set(true);
  }

  // Fermer le popup
  fermerEvaluationModal() {
    this.showEvaluationModal.set(false);
    this.resetEvaluationForm();
  }

  // Réinitialiser le formulaire
  resetEvaluationForm() {
    this.evaluationForm = {
      titre: '',
      type: '',
      mode: '',
      date: new Date().toISOString().split('T')[0],
      heureDebut: '',
      heureFin: '',
      description: '',
      fichier: null,
    };
  }

  // Gérer l'upload de fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        this.evaluationForm.fichier = file;
      } else {
        alert('Format de fichier non autorisé. Utilisez PDF, Image ou Document Word.');
      }
    }
  }

  // Supprimer le fichier sélectionné
  supprimerFichier() {
    this.evaluationForm.fichier = null;
    const fileInput = document.getElementById('fichierEvaluation') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Sauvegarder l'évaluation
  sauvegarderEvaluation() {
    // Vérifier les champs obligatoires
    if (!this.evaluationForm.titre.trim()) {
      alert('Veuillez saisir un titre');
      return;
    }
    if (!this.evaluationForm.type) {
      alert('Veuillez sélectionner un type');
      return;
    }
    if (!this.evaluationForm.mode) {
      alert('Veuillez sélectionner un mode');
      return;
    }
    if (!this.evaluationForm.date) {
      alert('Veuillez sélectionner une date');
      return;
    }
    if (!this.evaluationForm.heureDebut) {
      alert('Veuillez saisir une heure de début');
      return;
    }
    if (!this.evaluationForm.heureFin) {
      alert('Veuillez saisir une heure de fin');
      return;
    }
    const nouvelleEvaluation = {
      id: Date.now().toString(),
      titre: this.evaluationForm.titre,
      type: this.evaluationForm.type,
      mode: this.evaluationForm.mode,
      date: this.evaluationForm.date,
      heureDebut: this.evaluationForm.heureDebut,
      heureFin: this.evaluationForm.heureFin,
      description: this.evaluationForm.description,
      statut: 'En attente',
      fichier: this.evaluationForm.fichier?.name || null
    };

    // Ajouter à la liste des évaluations
    //  this.evaluations.update(prev => [...prev, nouvelleEvaluation]);

    // Afficher le fichier si présent
    if (this.evaluationForm.fichier) {
      console.log('Fichier joint:', this.evaluationForm.fichier.name);
    }

    alert(`Évaluation "${this.evaluationForm.titre}" créée avec succès !`);
    this.fermerEvaluationModal();
  }



  // Sélectionner une évaluation pour saisir les notes
  onEvaluationChange(event: any) {
    const evaluationId = event.target.value;
    this.selectedEvaluationForNotes = this.evaluations().find(e => e.id === evaluationId);

    // Charger les notes existantes pour cette évaluation
    this.chargerNotesPourEvaluation(this.selectedEvaluationForNotes);
  }

  // Charger les notes pour l'évaluation sélectionnée
  chargerNotesPourEvaluation(evaluation: any) {
    // Initialiser ou mettre à jour les notes
    this.currentNotesData = this.notes().map(note => ({
      ...note,
      noteActuelle: note.evaluations[evaluation.id] || null
    }));
  }

  // Sauvegarder la note pour un élève
  sauvegarderNote(eleveId: string, evaluationId: string, noteValue: number) {
    console.log(`Note ${noteValue} pour l'élève ${eleveId} à l'évaluation ${evaluationId}`);
    // Ici, appel API pour sauvegarder la note
  }

  // Sauvegarder toutes les notes
  sauvegarderNotes() {
    if (!this.selectedEvaluationForNotes) {
      alert('Veuillez d\'abord sélectionner une évaluation');
      return;
    }

    // Récupérer toutes les notes saisies
    const notesSaisies = this.currentNotesData.map(notes => ({
      eleveId: notes.eleveId,
      evaluationId: this.selectedEvaluationForNotes.id,
      //    note: notes.noteActuelle,
      appreciation: notes.appreciation
    }));

    console.log('Notes sauvegardées:', notesSaisies);
    alert(`Notes pour "${this.selectedEvaluationForNotes.titre}" sauvegardées avec succès !`);
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
