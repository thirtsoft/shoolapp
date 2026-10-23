import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CoursEnseignantCalendrier } from '../../../../core/models/enseignant/cours-enseignant-calendrier.model';
import { DetailsEnseignantUtilisateur } from '../../../../core/models/enseignant/details-enseignant-utilisateur';
import { AgendaSemaine } from '../../../../core/models/planification/agenda-semaine';
import { ListeCours } from '../../../../core/models/planification/liste-cours';
import { CoursJourEnseignant } from '../../../../core/models/statistique/enseignant/cours-jour-enseignant';
import { EnseignantDashboardKpis } from '../../../../core/models/statistique/enseignant/enseignant-dashboard-kpis';
import { EnseignantDashboardListData } from '../../../../core/models/statistique/enseignant/enseignant-dashboard-list-data';
import { NoteASaisirEnseignant } from '../../../../core/models/statistique/enseignant/note-a-saiair-enseignant';
import { ResponsabiliteClasseEnseignant } from '../../../../core/models/statistique/enseignant/responsabilite-classe-enseignant';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';

import { SlicePipe } from '@angular/common';
import { CalendarOptions, EventInput, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import classicThemePlugin from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { ActiviteEnseignant } from '../../../../core/models/planification/activite-enseignant';
import { ListeEnseignement } from '../../../../core/models/planification/liste-enseignement';
import { EnseignementContextService, GestionClasseContext } from '../../service/enseignement-contexte.service';
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

@Component({
  selector: 'app-dashboard-enseignant-component',
  standalone: true,
  imports: [FullCalendarModule, SlicePipe],
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
  notesARemplir = signal<NoteASaisirEnseignant[]>([]);

  coursEnseignant = signal<CoursEnseignantCalendrier[]>([]);

  mesEnseignements = signal<ListeEnseignement[]>([]);

  activitesAvenir = signal<ActiviteEnseignant[]>([]);

  coursDuJour = computed(() => {
    const jours: Record<number, string> = {
      0: 'DIMANCHE',
      1: 'LUNDI',
      2: 'MARDI',
      3: 'MERCREDI',
      4: 'JEUDI',
      5: 'VENDREDI',
      6: 'SAMEDI'
    };

    const jourActuel = jours[new Date().getDay()];

    return this.coursEnseignant()
      .filter(cours => cours.jourSemaine === jourActuel)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)
      );
  });


  showDetailsCoursModal = false;

  coursSelectionne = signal<CoursEnseignantCalendrier | null>(null);

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridDay',
    plugins: [
      classicThemePlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin
    ],

    firstDay: 1,
    weekends: true,
    allDaySlot: false,

    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    slotDuration: '00:30:00',

    height: 650,

    nowIndicator: true,

    editable: false,
    selectable: false,
    eventOverlap: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },

    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },

    dayHeaderFormat: {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    },

    events: [],

    eventContent: (arg) => this.afficherContenuCours(arg),

    eventClick: (info) => this.onCoursCalendarClick(info)
  };

  userFirstName: string = '';
  userLastName: string = '';
  userInitial: string = '';
  userFullName: string = '';
  userMobile: string = '';

  private readonly router = inject(Router);
  private readonly planificationService = inject(PlanificationResourceService);
  private readonly enseignementContextService = inject(EnseignementContextService);
  readonly localStorage = inject(LocalStorageService);

  constructor() {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    try {
      const userData = this.localStorage.getItem('v2_user');

      console.log('User data', userData);

      if (userData) {
        const user = JSON.parse(userData);
        this.userFirstName = user.firstName || user.firstname || user.prenom || '';
        this.userLastName = user.lastName || user.lastname || user.nom || '';
        this.userInitial = this.userFirstName.charAt(0).toUpperCase();
        this.userFullName = `${this.userFirstName} ${this.userLastName}`.trim();
        this.userMobile = user.mobile || user.mobile || user.mobile || '';
      } else {
        this.userFirstName = 'Utilisateur';
        this.userLastName = '';
        this.userInitial = 'U';
        this.userFullName = 'Utilisateur';
        this.userMobile = '+221776532145';
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      this.userFirstName = 'Utilisateur';
      this.userLastName = '';
      this.userInitial = 'U';
      this.userFullName = 'Utilisateur';
      this.userMobile = '+221776532145';
    }
  }

  refreshUserInfo(): void {
    this.loadUserInfo();
  }


  // ── Messages récents ───────────────────────────────
  messages = signal<MessageProfesseur[]>([
    { id: '1', expediteur: 'Mme Diop', role: 'Administration', sujet: 'Conseil de classe - Planning', date: '15 Mars', nonLu: true },
    { id: '2', expediteur: 'M. Ndiaye', role: 'Prof. SVT', sujet: 'Projet interdisciplinaire', date: '14 Mars', nonLu: true },
    { id: '3', expediteur: 'Parent élève', role: 'M. Diallo', sujet: 'Suivi de Moussa Diop', date: '12 Mars', nonLu: false },
  ]);

  messagesNonLus = computed(() => this.messages().filter(m => m.nonLu).length);

  ngOnInit(): void {
    this.chargerMesCours();
    this.chargerMesEnseignements();
    this.chargerActivitesAvenir();
  }

  chargerMesCours(): void {
    this.planificationService.getMesCoursEnseignant().subscribe({
      next: (data) => {
        const cours = data ?? [];

        this.coursEnseignant.set(cours);

        const events = this.convertirCoursEnEvenements(cours);

        this.calendarOptions = {
          ...this.calendarOptions,
          events
        };
      },

      error: (err) => {
        console.error('Erreur lors du chargement des cours de l’enseignant', err);

        this.coursEnseignant.set([]);

        this.calendarOptions = {
          ...this.calendarOptions,
          events: []
        };
      }
    });
  }

  private trouverCoursDuContexte(enseignement: ListeEnseignement): CoursEnseignantCalendrier | undefined {
    const coursCompatibles = this.coursEnseignant().filter(cours => {
      const memeEnseignement = Number(cours.enseignementId) === Number(enseignement.id);
      const memeClasse = Number(cours.classe?.id) === Number(enseignement.classId);
      const memeAnneeScolaire = Number(cours.anneeScolaire?.id) === Number(enseignement.anneeScolaireId);

      return (
        memeEnseignement &&
        memeClasse &&
        memeAnneeScolaire
      );
    });

    if (coursCompatibles.length === 0) {
      console.warn('Aucun cours compatible trouvé.', enseignement);
      return undefined;
    }

    const maintenant = new Date();
    const minutesActuelles = maintenant.getHours() * 60 + maintenant.getMinutes();
    const convertirEnMinutes = (heure?: string): number => {
      if (!heure) {
        return 0;
      }

      const [heures, minutes] = heure.substring(0, 5).split(':').map(Number);

      return heures * 60 + minutes;
    };

    const joursSemaine: Record<number, string> = {
      0: 'DIMANCHE',
      1: 'LUNDI',
      2: 'MARDI',
      3: 'MERCREDI',
      4: 'JEUDI',
      5: 'VENDREDI',
      6: 'SAMEDI'
    };

    const jourActuel = joursSemaine[maintenant.getDay()];

    const coursDuJour = coursCompatibles.filter(cours => cours.jourSemaine?.trim().toUpperCase() === jourActuel)
      .sort((a, b) => convertirEnMinutes(a.heureDebut) - convertirEnMinutes(b.heureDebut));

    const coursEnCours = coursDuJour.find(cours => {
      const debut = convertirEnMinutes(cours.heureDebut);
      const fin = convertirEnMinutes(cours.heureFin);

      return (minutesActuelles >= debut && minutesActuelles < fin);
    });

    if (coursEnCours) {
      return coursEnCours;
    }

    if (coursDuJour.length > 0) {
      const coursDuJourSelectionne = coursDuJour[coursDuJour.length - 1];
      return coursDuJourSelectionne;
    }

    const coursFallback = coursCompatibles.sort((a, b) => convertirEnMinutes(a.heureDebut) - convertirEnMinutes(b.heureDebut))[0];

    return coursFallback;
  }

  chargerMesEnseignements(): void {
    this.planificationService.getMesEnseignements().subscribe({
      next: (data) => {
        const enseignements = data ?? [];

        this.mesEnseignements.set(enseignements);
      },

      error: (err) => {
        console.error('Erreur lors du chargement des enseignements de l’enseignant', err);
        this.mesEnseignements.set([]);
      }
    });
  }

  gererClasse(enseignement: ListeEnseignement): void {
    const cours = this.trouverCoursDuContexte(enseignement);
    const contexte: GestionClasseContext = {
      classId: enseignement.classId,
      classe: enseignement.classe,
      classeUuid: enseignement.classeUuid,
      matiere: enseignement.matiere,
      anneeScolaire: enseignement.anneeScolaire,
      anneeScolaireId: enseignement.anneeScolaireId,
      anneeScolaireUuid: enseignement.anneeScolaireUuid,
      enseignementId: enseignement.id,
      courseId: cours?.coursId,
      courseUuid: cours?.courseUuid,
      heureDebut: cours?.heureDebut,
      heureFin: cours?.heureFin
    };
    this.enseignementContextService.setGestionClasseContext(contexte);
    void this.router.navigate(['/enseignant/gestion-classe', enseignement.classId]);
  }

  private convertirCoursEnEvenements(cours: CoursEnseignantCalendrier[]): EventInput[] {
    return cours.map(c => {
      const couleur = this.getCouleurClasse(c.classe?.id);
      return {
        id: String(c.coursId),
        title: c.libelle,
        daysOfWeek: [this.convertirJourSemaine(c.jourSemaine)],
        startTime: this.normaliserHeure(c.heureDebut),
        endTime: this.normaliserHeure(c.heureFin),
        startRecur: c.dateDebut,
        endRecur: this.ajouterUnJour(c.dateFin!),

        backgroundColor: couleur,
        borderColor: couleur,
        textColor: '#ffffff',

        extendedProps: {
          coursId: c.coursId,
          courseUuid: c.courseUuid,
          enseignementId: c.enseignementId,
          classe: c.classe?.libelle,
          matiere: c.matiere?.libelle,
          salle: c.salle?.libelle,
          anneeScolaire: c.anneeScolaire?.libelle,
          emploiDuTemps: c.emploiDuTemps?.titre,
          dateDebut: c.dateDebut,
          dateFin: c.dateFin,
          heureDebut: c.heureDebut,
          heureFin: c.heureFin
        }
      };
    });
  }

  chargerActivitesAvenir(): void {
    this.planificationService.getActivitesAvenirEnseignant().subscribe({
      next: (data) => {
        this.activitesAvenir.set(data ?? []);
      },

      error: (err) => {
        console.error('Erreur lors du chargement des activités à venir', err);

        this.activitesAvenir.set([]);
      }
    });
  }


  private convertirJourSemaine(jour: string): number {
    const jours: Record<string, number> = {
      DIMANCHE: 0,
      LUNDI: 1,
      MARDI: 2,
      MERCREDI: 3,
      JEUDI: 4,
      VENDREDI: 5,
      SAMEDI: 6
    };
    return jours[jour?.trim().toUpperCase()] ?? 1;
  }

  private normaliserHeure(heure: string): string {
    if (!heure) {
      return '00:00:00';
    }
    return heure.length >= 8 ? heure.substring(0, 8) : `${heure.substring(0, 5)}:00`;
  }

  private ajouterUnJour(date: string): string {
    if (!date) {
      return '';
    }
    const d = new Date(`${date.substring(0, 10)}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().substring(0, 10);
  }

  private getCouleurClasse(classeId?: number): string {
    const couleurs: Record<number, string> = {
      10: '#2563eb',
      14: '#7c3aed'
    };
    return couleurs[classeId ?? 0] ?? '#2c5282';
  }


  onCoursCalendarClick(info: any): void {
    const coursId = Number(info.event.extendedProps?.coursId);
    const cours = this.coursEnseignant().find(c => c.coursId === coursId);
    if (!cours) {
      return;
    }

    this.coursSelectionne.set(cours);
    this.showDetailsCoursModal = true;
  }

  closeDetailsCoursModal(): void {
    this.showDetailsCoursModal = false;
    this.coursSelectionne.set(null);
  }

  formaterDate(date: string | undefined): string {
    if (!date) {
      return '';
    }
    const valeur = date.substring(0, 10);
    const [annee, mois, jour] = valeur.split('-');
    return `${jour}/${mois}/${annee}`;
  }

  afficherContenuCours(arg: any): { domNodes: HTMLElement[] } {
    const container = document.createElement('div');
    container.className = 'calendar-event-content';

    const titre = document.createElement('div');
    titre.className = 'calendar-event-title';
    titre.textContent = arg.event.title;

    const horaire = document.createElement('div');
    horaire.className = 'calendar-event-time';

    const heureDebut = arg.event.extendedProps.heureDebut ?? '';
    const heureFin = arg.event.extendedProps.heureFin ?? '';

    horaire.textContent = `${heureDebut.substring(0, 5)} - ${heureFin.substring(0, 5)}`;

    container.appendChild(titre);
    container.appendChild(horaire);

    return { domNodes: [container] };
  }

  getStatutCours(cours: CoursEnseignantCalendrier): 'termine' | 'en_cours' | 'a_venir' {
    const maintenant = new Date();
    const [heureDebut, minuteDebut] = cours.heureDebut.substring(0, 5).split(':').map(Number);
    const [heureFin, minuteFin] = cours.heureFin.substring(0, 5).split(':').map(Number);
    const debut = new Date();
    debut.setHours(heureDebut, minuteDebut, 0, 0);
    const fin = new Date();
    fin.setHours(heureFin, minuteFin, 0, 0);
    if (maintenant < debut) {
      return 'a_venir';
    }
    if (maintenant >= debut && maintenant <= fin) {
      return 'en_cours';
    }

    return 'termine';
  }

  getStatutCoursLabel(cours: CoursEnseignantCalendrier): string {
    const statut = this.getStatutCours(cours);
    const labels = { termine: 'Terminé', en_cours: 'En cours', a_venir: 'À venir' };
    return labels[statut];
  }

  getDureeCours(cours: CoursEnseignantCalendrier): string {
    const [h1, m1] = cours.heureDebut.substring(0, 5).split(':').map(Number);
    const [h2, m2] = cours.heureFin.substring(0, 5).split(':').map(Number);
    const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const heures = Math.floor(minutes / 60);
    const reste = minutes % 60;
    if (reste === 0) {
      return `${heures}h`;
    }
    return `${heures}h${reste.toString().padStart(2, '0')}`;
  }

  naviguer(route: string): void {
    void this.router.navigate([route]);
  }
}

