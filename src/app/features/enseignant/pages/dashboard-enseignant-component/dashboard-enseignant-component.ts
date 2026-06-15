import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DetailsEnseignantUtilisateur } from '../../../../core/models/enseignant/details-enseignant-utilisateur';
import { AgendaSemaine } from '../../../../core/models/planification/agenda-semaine';
import { ListeCours } from '../../../../core/models/planification/liste-cours';
import { ActiviteAvenirEnseignant } from '../../../../core/models/statistique/enseignant/activite-a-venir-enseignant';
import { CoursJourEnseignant } from '../../../../core/models/statistique/enseignant/cours-jour-enseignant';
import { EnseignantDashboardKpis } from '../../../../core/models/statistique/enseignant/enseignant-dashboard-kpis';
import { EnseignantDashboardListData } from '../../../../core/models/statistique/enseignant/enseignant-dashboard-list-data';
import { NoteASaisirEnseignant } from '../../../../core/models/statistique/enseignant/note-a-saiair-enseignant';
import { ResponsabiliteClasseEnseignant } from '../../../../core/models/statistique/enseignant/responsabilite-classe-enseignant';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { EnseigantResourceService } from '../../service/enseigant-resource.service';


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
  selector: 'app-dashboard-enseignant-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-enseignant-component.html',
  styleUrl: './dashboard-enseignant-component.css',
})
export class DashboardEnseignantComponent implements OnInit {


  coursList: ListeCours[] = [];
  agendaSemaineList: AgendaSemaine[] = [];
  enseignantDetails: DetailsEnseignantUtilisateur = {};
  enseignantDashboardKpis: EnseignantDashboardKpis = {};
  enseignantDashboardListData: EnseignantDashboardListData = {};

  coursJournes = signal<CoursJourEnseignant[]>([]);
  mesResponsabilites = signal<ResponsabiliteClasseEnseignant[]>([]);
  activitesAvenir = signal<ActiviteAvenirEnseignant[]>([]);
  notesARemplir = signal<NoteASaisirEnseignant[]>([]);

  userId: number;


  private readonly router = inject(Router);
  private readonly planificationService = inject(PlanificationResourceService);
  private readonly enseigantResourceService = inject(EnseigantResourceService);
  private readonly localStorage = inject(LocalStorageService);

  constructor() {
    this.userId = this.localStorage.getItem('id');
  }

  // ── Informations professeur ────────────────────────
  professeur = signal({
    nom: 'M. Sall',
    matiere: 'Mathématiques',
    avatar: '👨‍🏫'
  });

  // ── KPIs principaux ────────────────────────────────

  kpis = signal([
    {
      label: 'Cours aujourd\'hui',
      val: '3 cours',
      ico: '🕐',
      detail: '6 heures de face-à-face',
      couleur: 'bleu'
    },
    {
      label: 'Notes en attente',
      val: '3 évals',
      ico: '📝',
      detail: '28 copies restant à saisir',
      couleur: 'rouge'
    },
    {
      label: 'Élèves à soutenir',
      val: '5 élèves',
      ico: '⚠️',
      detail: 'En difficulté ce trimestre',
      couleur: 'or'
    },
    {
      label: 'Suivi des appels',
      val: '1 manquant',
      ico: '📌',
      detail: 'Classe de Première S1',
      couleur: 'vert'
    }
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
  /*
  notesARemplir = signal<NoteARemplir[]>([
    { classe: 'Terminale S2', evaluation: 'DS n°4 - Fonctions', date: '15 Mars', nbNotes: 12, nbEleves: 38, progression: 32 },
    { classe: 'Première S1', evaluation: 'Interro - Dérivées', date: '12 Mars', nbNotes: 8, nbEleves: 42, progression: 19 },
    { classe: 'Seconde S2', evaluation: 'DM - Géométrie', date: '10 Mars', nbNotes: 8, nbEleves: 40, progression: 20 },
  ])*/

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

  ngOnInit(): void {
    if (this.userId && this.userId != undefined) {
      this.getEnseignantByUtilisateurId(this.userId);
    }
  }

  // ── Méthodes ───────────────────────────────────────
  getStatutCoursCls(statut: string): string {
    const classes: Record<string, string> = {
      termine: 'termine',
      en_cours: 'en-cours',
      a_venir: 'a-venir'
    };
    return classes[statut] || '';
  }

  getEnseignantByUtilisateurId(userId: number): Promise<[DetailsEnseignantUtilisateur]> {
    return new Promise((resolve, reject) => {
      this.enseigantResourceService.getSingleResource('enseignant/utilisateur', userId).subscribe({
        next: (data: any) => {
          this.enseignantDetails = data;
          console.log('enseignantDetails', this.enseignantDetails);
          this.getEnseignantDashboardKpis(this.enseignantDetails.id!);
          this.getEnseignantDashboardListData(this.enseignantDetails.id!)
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getEnseignantDashboardKpis(ensId: number): Promise<EnseignantDashboardKpis> {
    return new Promise((resolve, reject) => {
      this.enseigantResourceService.getSingleResource('statistique/enseignant', ensId).subscribe({
        next: (data: any) => {
          this.enseignantDashboardKpis = data;
          console.log('enseignantDashboardKpis', this.enseignantDashboardKpis);

          if (data && typeof data === 'object') {
            this.mapApiDataToSignals(data);
          }

          resolve(data);
        },
        error: (err) => {
          console.error('Erreur API KPIs, conservation des données mockées.', err);
          reject(err);
        }
      });
    });
  }

  private mapApiDataToSignals(data: EnseignantDashboardKpis): void {
    this.kpis.set([
      {
        label: 'Cours aujourd\'hui',
        val: '3 cours',
        ico: '🕐',
        detail: '6 heures de face-à-face',
        couleur: 'bleu'
      },
      {
        label: 'Notes en attente',
        val: '3 évals',
        ico: '📝',
        detail: '28 copies restant à saisir',
        couleur: 'rouge'
      },
      {
        label: 'Élèves à soutenir',
        val: '5 élèves',
        ico: '⚠️',
        detail: 'En difficulté ce trimestre',
        couleur: 'or'
      },
      {
        label: 'Suivi des appels',
        val: '1 manquant',
        ico: '📌',
        detail: 'Classe de Première S1',
        couleur: 'vert'
      }
    ]);
  }

  getEnseignantDashboardListData(ensId: number): Promise<EnseignantDashboardListData> {
    return new Promise((resolve, reject) => {
      this.enseigantResourceService.getSingleResource('statistique/list/enseignant', ensId).subscribe({
        next: (data: any) => {
          this.enseignantDashboardListData = data;
          console.log('enseignantDashboardListData', this.enseignantDashboardListData);

          if (data) {
            if (data.coursDuJour) this.coursJournes.set(data.coursDuJour);
            if (data.mesResponsabilites) this.mesResponsabilites.set(data.mesResponsabilites);
            if (data.activitesAvenir) this.activitesAvenir.set(data.activitesAvenir);
            if (data.notesASaisir) this.notesARemplir.set(data.notesASaisir);
          }

          resolve(data);
        },
        error: (err) => {
          console.error('Erreur API KPIs, conservation des données.', err);
          reject(err);
        }
      });
    });
  }


  getAgendatSemaineEnseignant(userId: number): Promise<[AgendaSemaine]> {
    return new Promise((resolve, reject) => {
      this.planificationService.getResources('enseignant/agenda/semaine', this.userId).subscribe({
        next: (data: any) => {
          this.agendaSemaineList = data;
          console.log('Cours list', this.agendaSemaineList);
          resolve(data);
        },
        error: (err) => reject(err)
      });
    });
  }

  getCoursSemaineEnseignant(enseiId: number): Promise<ListeCours[]> {
    return new Promise((resolve, reject) => {
      this.planificationService.getListeCoursSemaineByEnseignant(enseiId).subscribe({
        next: (data: any) => {
          this.coursList = data;
          console.log('Cours list', this.coursList);
          if (!data || data.length === 0) {
            console.log('Aucun cours cette semaine, basculement vers tous les cours');
            this.planificationService.getAllCourses().subscribe({
              next: (allCourses) => {
                this.coursList = allCourses;
                console.log('Cours list', this.coursList);
              },
              error: (err) => {
                console.error('Erreur lors du chargement de tous les cours', err);
                reject(err);
              }
            });
          } else {
            resolve(data);
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des cours de la semaine', err);
          // En cas d'erreur, essayer le fallback
          this.planificationService.getAllCourses().subscribe({
            next: (allCourses) => {
              this.coursList = allCourses;
              resolve(allCourses);
            },
            error: (err2) => reject(err2)
          });
        }
      });
    });
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

