import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { EvaluationEditNote } from '../../../../core/models/dossiereleve/evaluation/evaluation-edit-note';
import { EvaluationEditRequest } from '../../../../core/models/dossiereleve/evaluation/evaluation-edit-resquest';
import { ListeEleve } from '../../../../core/models/dossiereleve/liste-eleve';
import { SessionSemestre } from '../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../core/services/common.service';
import { PieceJointeService } from '../../../../core/services/piece-jointe';
import { DossierResourceService } from '../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { Etat } from '../../../administration/referentiel/pages/semestre/editer-session-semestre-component/editer-session-semestre-component';
import { ReferentielService } from '../../../administration/referentiel/service/referentiel.service';
import { EnseignantService } from '../../service/enseignant.service';
import { EnseignementContextService, GestionClasseContext } from '../../service/enseignement-contexte.service';
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

export interface NoteSaisie {
  id: number;
  eleve: number;
  nomComplet: string;
  note: number;
  appreciation: string;
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
  imports: [RouterModule, FormsModule, DatePipe, ReactiveFormsModule, GenericTableDossierComponent],
  templateUrl: './classe-management-component.html',
  styleUrl: './classe-management-component.css',
})
export class ClasseManagementComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  filteredDataExercice: any;
  isLockable: boolean = true;
  isTable: boolean = true;
  deleteExerciceEndpoint = "exercice";
  columns: any = [];
  exerciceData: any = [];

  deleteEvaluationEndpoint = "evaluation";
  evaluationData: any = [];

  sessionSemestreList: any[] = [];
  etatEvaluationOptions: any[] = [];


  etatCongesList: Etat[] = [
    {
      id: 8,
      code: 'E8',
      libelle: 'En cours',

    },
    {
      id: 2,
      code: 'E2',
      libelle: 'Remise',

    },
    {
      id: 3,
      code: 'E3',
      libelle: 'Envoyée',

    },
    {
      id: 4,
      code: 'E4',
      libelle: 'Validée',

    }
  ];



  public readonly String = String;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  tableSizes = [10, 20, 50, 100];

  moisList: any[] = [];

  tableFilters: IFilterConfig[] = [];
  activeFilters: any = {};
  hasActiveFilters: boolean = false;

  classeId?: number;

  contexteClasse = signal<GestionClasseContext | null>(null);

  isSavingNotes: boolean = false;
  selectedEvaluationForNotes: any = null;
  currentNotesData: NoteEleve[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly referentielService = inject(ReferentielService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly toastService = inject(ToastrService)
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly commonService = inject(CommonService);
  private readonly enseignementContextService = inject(EnseignementContextService);
  private readonly dossierResource = inject(DossierResourceService);

  constructor(
  ) {
    this.classeId = Number(this.activeRoute.snapshot.params['id']);

    console.log('ClassID', this.classeId);

    const contexte = this.enseignementContextService.getGestionClasseContext();

    if (contexte) {
      this.contexteClasse.set(contexte);

      console.log('contexteClasse', this.contexteClasse()?.classe);
      console.log('contexteClasse', this.contexteClasse()?.matiere);
      console.log('contexteClasse', this.contexteClasse()?.anneeScolaire);
    }

  }

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

  evaluationForNotes: EvaluationEditNote[] = [];

  notesData = signal<NoteSaisie[]>([]);
  eleveList: ListeEleve[] = [];

  moyenneClasse: number = 0;
  noteMaximale: number = 0;
  noteMinimale: number = 0;

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



  ngOnInit(): void {
    this.chargerDonnees();
    this.chargerLesExercices();
    this.chargerLesEvaluations();
    this.getEvaluationsList();
  }

  async chargerLesExercices() {
    try {
      await Promise.all([
        this.getMoisList(),
      ]);

      this.initialisationDesFiltresExercice();
      this.chargerLesDonneesExercices(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  async chargerLesEvaluations() {
    try {
      await Promise.all([
        this.getEtatEvaluationList(),
        this.getMoisList(),
        this.getSessionSemestreList()
      ]);

      this.initialisationDesFiltresEvaluation();
      this.chargerLesDonneesEvaluation(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {
    return new Promise((resolve, reject) => {
      this.planification.getResourceListe('referentiel/sessionsemestre').subscribe({
        next: (data: any) => {
          this.sessionSemestreList = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getEvaluationsList(): Promise<EvaluationEditRequest[]> {
    return new Promise((resolve, reject) => {
      this.planification.getResourceListByElement('evaluation/listclasse', Number(this.classeId)).subscribe({
        next: (data: any) => {
          this.evaluationForNotes = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  getEtatEvaluationList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getEtatEvaluations().subscribe({
        next: (data: any) => {
          this.etatEvaluationOptions = data;
          resolve(data);
        },
        error: (err: any) => reject(err)
      });
    });
  }

  initialisationDesFiltresEvaluation() {
    this.tableFilters = [
      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(s => ({
          value: s.id,
          label: `${s.semestre}`
        }))
      },

      {
        key: 'etat',
        label: 'Etat',
        type: 'select',
        options: this.etatEvaluationOptions.map(e => ({
          value: e.etat,
          label: e.etat
        }))
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: m.mois
        }))
      },

    ];
  }

  chargerLesDonneesEvaluation(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreDeFiltreEvaluation();

      apiCall = this.planification.fetchFilterDataTable(
        'evaluation/classe',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planification.getResourceByIdPaged('evaluation/classe', Number(this.classeId), this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.evaluationData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.evaluationData = this.evaluationData?.map((item: any) => ({
          ...item,

          dureEvaluation: item.heureDebut + ' à  ' + item.heureFin

        }));

        this.columns = [
          { key: 'numeroEvaluation', header: 'N°' },
          { key: 'titre', header: 'Titre' },
          { key: 'evaluationMode', header: 'Mode' },
          { key: 'sessionSemestre', header: 'Semestre' },
          { key: 'evaluationType', header: 'Type' },
          { key: 'etat', header: 'Etat' },
          { key: 'dateEvaluation', header: 'Date' },
          { key: 'dureEvaluation', header: 'Heure' },

        ];


        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireParametreDeFiltreEvaluation(): any {
    const filtreObj: any = {};
    if (this.activeFilters?.sessionSemestre) {
      filtreObj.sessionSemestre = this.activeFilters.sessionSemestre;
    }
    if (this.activeFilters.etat) {
      filtreObj.etat = this.activeFilters.etat;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;

  }

  get totalPagesEvaluation(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePageEvaluation(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesEvaluation(this.hasActiveFilters);
    }
  }

  changeSizeEvaluation(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonneesEvaluation(this.hasActiveFilters);
    }
  }

  resetFiltersEvaluation() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltresEvaluation();
    this.currentPage = 0;
    this.chargerLesDonneesEvaluation(false);
  }

  canEditOrDeleteEvaluation(item: any): boolean {
    return item.etat !== 'Validée';
  }


  getMoisList(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.commonService.getAllMois().subscribe({
        next: (data) => {
          this.moisList = data;
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  initialisationDesFiltresExercice() {
    this.tableFilters = [
      {
        key: 'titre',
        label: 'Titre exercice',
        type: 'text',
        placeholder: 'Rechercher un exercie...'
      },
      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(m => ({
          value: m.id,
          label: `${m.mois}`
        }))
      },
    ];
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;

    this.hasActiveFilters = Object.values(this.activeFilters).some(val =>
      val !== null && val !== undefined && val !== ''
    );
    this.currentPage = 0;
    this.chargerLesDonneesExercices(this.hasActiveFilters);
  }

  chargerLesDonneesExercices(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {

      const filtreParam = this.construireParametreFiltre();

      apiCall = this.planification.fetchFilterDataTable(
        'planification/enseignant/exercice/me',
        this.currentPage,
        this.pageSize,
        filtreParam)

    } else {
      apiCall = this.planification.getResourceByIdPaged('planification/enseignant/exercice/me', Number(this.classeId), this.currentPage, this.pageSize);
    }
    apiCall.subscribe({
      next: (response) => {
        this.exerciceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.columns = [
          { key: 'numeroExercice', header: 'N°' },
          { key: 'titre', header: 'Titre' },
          { key: 'livre', header: 'Livre' },
          { key: 'page', header: 'Page' },
          { key: 'etatLibelle', header: 'Etat' },
          { key: 'description', header: 'Description' },
          { key: 'dateDebut', header: 'Date début' },
          { key: 'dateFin', header: 'Date Fin' },
        ];
        this.exerciceData = this.exerciceData.map((item: any) => ({
          ...item,
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.isLoading = false;
      }
    });
  }

  construireParametreFiltre(): any {
    const filtreObj: any = {};

    if (this.activeFilters.titre) {
      filtreObj.titre = this.activeFilters.titre;
    }
    if (this.activeFilters.mois) {
      filtreObj.mois = this.activeFilters.mois;
    }
    return Object.keys(filtreObj).length > 0 ? filtreObj : null;

  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesExercices(this.hasActiveFilters);
    }
  }


  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonneesExercices(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltresExercice();
    this.currentPage = 0;
    this.chargerLesDonneesExercices(false);
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
    void this.router.navigate(['/enseignant/exercice/create']);
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
    void this.router.navigate(['/enseignant/evaluation']);
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

    if (this.evaluationForm.fichier) {
      console.log('Fichier joint:', this.evaluationForm.fichier.name);
    }

    alert(`Évaluation "${this.evaluationForm.titre}" créée avec succès !`);
    this.fermerEvaluationModal();
  }

  onEvaluationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const evaluationId = Number(select.value);

    const evaluationComplete = this.evaluationForNotes.find(
      e => e.id === evaluationId
    );

    if (!evaluationComplete) {
      this.selectedEvaluationForNotes = null;
      this.notesData.set([]);
      this.calculerStatistiques();
      return;
    }

    this.selectedEvaluationForNotes = evaluationComplete;

    this.loadNotesFromEvaluation(evaluationComplete);
  }

  loadNotesFromEvaluation(evaluation: any): void {

    const listeNotes = evaluation.noteEditRequestDTOList ?? [];

    const notesFormatees: NoteSaisie[] = listeNotes.map((note: any) => ({
      id: note.id,
      eleve: note.eleve,
      nomComplet: note.nomCompletEleve ?? `Élève ${note.eleve}`,
      note: note.note ?? null,
      appreciation: note.appreciation ?? ''
    }));

    this.notesData.set(notesFormatees);

    this.calculerStatistiques();

    console.log('Évaluation sélectionnée :', evaluation);
    console.log('Notes chargées :', this.notesData());
  }

  calculerStatistiques(): void {
    const notes = this.notesData();

    const notesValues = notes
      .map(n => n.note)
      .filter((note): note is number =>
        note !== null &&
        note !== undefined &&
        !Number.isNaN(Number(note))
      )
      .map(note => Number(note));

    if (notesValues.length === 0) {
      this.moyenneClasse = 0;
      this.noteMaximale = 0;
      this.noteMinimale = 0;
      return;
    }

    const somme = notesValues.reduce((total, note) => total + note, 0);

    this.moyenneClasse = Number((somme / notesValues.length).toFixed(2));

    this.noteMaximale = Math.max(...notesValues);
    this.noteMinimale = Math.min(...notesValues);
  }

  sauvegarderNotes(): void {
    if (!this.selectedEvaluationForNotes) {
      this.toastService.warning('Veuillez d’abord sélectionner une évaluation.');
      return;
    }

    const evaluation = this.selectedEvaluationForNotes as EvaluationEditRequest;
    const noteMax = 20;
    const evaluationId = Number(evaluation.id);

    const noteInvalide = this.notesData().find(note =>
      note.note !== null &&
      (
        Number.isNaN(Number(note.note)) ||
        Number(note.note) < 0 ||
        Number(note.note) > noteMax
      )
    );

    if (noteInvalide) {
      this.toastService.error(`La note de ${noteInvalide.nomComplet} doit être comprise entre 0 et ${noteMax}.`);
      return;
    }

    const noteEditRequestDTOList = this.notesData().map(note => {

      const noteOriginale = (evaluation.noteEditRequestDTOList ?? [])
        .find((n: any) => n.id === note.id);

      return {
        id: note.id,
        eleve: Number(note.eleve),
        nomCompletEleve: noteOriginale?.nomCompletEleve ?? note.nomComplet,
        note: note.note !== null
          ? Number(note.note)
          : null,

        type: evaluation.evaluationType,
        dateCreation: noteOriginale?.dateCreation ?? null,
        appreciation: note.appreciation ?? '',
        actif: noteOriginale?.actif ?? 1
      };
    });

    const payload: any = {
      id: evaluation.id,
      numeroEvaluation: evaluation.numeroEvaluation,
      titre: evaluation.titre,
      description: evaluation.description,
      dateEvaluation: evaluation.dateEvaluation,
      dateRemise: evaluation.dateRemise,
      dateCreation: evaluation.dateCreation,
      enseignementId: evaluation.enseignementId,
      sessionSemestre: evaluation.sessionSemestre,
      evaluationType: evaluation.evaluationType,
      evaluationMode: evaluation.evaluationMode,
      etatId: evaluation.etatId,
      libelleEtat: evaluation.libelleEtat,
      classeId: evaluation.classeId,
      heureDebut: evaluation.heureDebut,
      heureFin: evaluation.heureFin,
      noteEditRequestDTOList,
      actif: evaluation.actif
    };
    console.log('Payload UPDATE évaluation + notes :', JSON.stringify(payload, null, 2));

    this.isSavingNotes = true;

    this.dossierResource.updateNotesEvaluationsReource(`evaluation`, evaluationId, payload)
      .subscribe({
        next: (response: any) => {

          this.isSavingNotes = false;

          this.toastService.success(
            `Les notes de "${evaluation.titre}" ont été enregistrées avec succès.`
          );

          this.getEvaluationsList().then(() => {

            const evaluationUpdated = this.evaluationForNotes.find(e => e.id === evaluation.id);

            if (evaluationUpdated) {
              this.selectedEvaluationForNotes = evaluationUpdated;
              this.loadNotesFromEvaluation(evaluationUpdated);
            }
          });
        },

        error: (error: any) => {

          this.isSavingNotes = false;
          console.error('Erreur lors de la sauvegarde des notes :', error);

          this.toastService.error(
            error?.error?.message ??
            'Une erreur est survenue lors de l’enregistrement des notes.'
          );
        }
      });
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
