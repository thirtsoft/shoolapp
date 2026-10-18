import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IFilterConfig } from '../../../../core/filtered-config/FiltreConfiguration';
import { GenericTableDossierComponent } from '../../../../core/generic/generic-table-dossier/generic-table-dossier.component';
import { AbsenceHistorique, AttendanceStatus } from '../../../../core/models/dossiereleve/absence/absence-historique';
import { AttendanceRecordRequest } from '../../../../core/models/dossiereleve/absence/attendance-record-request';
import { AttendanceRecordResponse } from '../../../../core/models/dossiereleve/absence/attendance-record-response';
import { FaireAppelRequest } from '../../../../core/models/dossiereleve/absence/faire-appel-request';
import { EvaluationEditNote } from '../../../../core/models/dossiereleve/evaluation/evaluation-edit-note';
import { EvaluationEditRequest } from '../../../../core/models/dossiereleve/evaluation/evaluation-edit-resquest';
import { ListeEleve } from '../../../../core/models/dossiereleve/liste-eleve';
import { SessionSemestre } from '../../../../core/models/referentiels/session-semestre';
import { CommonService } from '../../../../core/services/common.service';
import { DossierResourceService } from '../../../administration/dossier-eleve/service/dossier-resource.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { EnseignementContextService, GestionClasseContext } from '../../service/enseignement-contexte.service';
import { ListEvaluationEnseignantComponent } from '../evaluation/list-evaluation-enseignant/list-evaluation-enseignant.component';
import { ListExerciceComponent } from '../exercice/list-exercice/list-exercice.component';

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

export interface Eleve {
  id: number;
  inscriptionId?: number;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  attendanceStatus: AttendanceStatus;
  motif?: string;
  justified?: boolean;
  arrivalTime?: string;
  lateMinutes?: number;
}
export interface EleveInscritClasse {
  inscriptionId: number;
  eleveId: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  sexe: 'M' | 'F';
  classeId: number;
  anneeScolaireId: number;
  attendanceStatus: AttendanceStatus;
  motif?: string;
  justified?: boolean;
  arrivalTime?: string;
  lateMinutes?: number;
}

export interface NoteEleve {
  eleveId: string;
  nom: string;
  prenom: string;
  evaluations: { [evaluationId: string]: number | null; };
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


@Component({
  selector: 'app-classe-management-component',
  standalone: true,
  imports: [RouterModule, FormsModule, DatePipe, ReactiveFormsModule,
    GenericTableDossierComponent,
    ListExerciceComponent, ListEvaluationEnseignantComponent],
  templateUrl: './classe-management-component.html',
  styleUrl: './classe-management-component.css',
})
export class ClasseManagementComponent implements OnInit {

  isEdit: boolean = true;
  isLoading: boolean = false;
  isLockable: boolean = true;
  isTable: boolean = true;
  columns: any = [];

  deleteAttendanceEndpoint = 'attendance';
  attendanceData: any = [];

  sessionSemestreList: any[] = [];
  etatEvaluationOptions: any[] = [];

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

  activeTab = signal<string>('appel');
  activeAppelView = signal<'faire-appel' | 'historique'>('faire-appel');

  historiqueAbsences = signal<AbsenceHistorique[]>([]);
  isSavingAppel = signal<boolean>(false);
  isLoadingHistorique = signal<boolean>(false);
  isLoadingEleves = signal<boolean>(false);
  elevesInscrits = signal<EleveInscritClasse[]>([]);
  eleves = signal<Eleve[]>([]);

  attendancesDuJour = signal<AttendanceRecordResponse[]>([]);
  appelDejaEffectue = signal<boolean>(false);
  isLoadingAppel = signal<boolean>(false);
  notes = signal<NoteEleve[]>([]);
  evaluationForNotes: EvaluationEditNote[] = [];
  notesData = signal<NoteSaisie[]>([]);

  eleveList: ListeEleve[] = [];

  moyenneClasse: number = 0;
  noteMaximale: number = 0;
  noteMinimale: number = 0;

  showAbsenceFormModal = signal<boolean>(false);
  currentEleveForAbsence: Eleve | null = null;
  showEvaluationModal = signal<boolean>(false);

  private readonly route = inject(ActivatedRoute);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly commonService = inject(CommonService);
  private readonly enseignementContextService = inject(EnseignementContextService);
  private readonly dossierResource = inject(DossierResourceService);

  constructor() {
    this.classeId = Number(this.activeRoute.snapshot.params['id']);

    const contexte = this.enseignementContextService.getGestionClasseContext();

    if (contexte) {
      this.contexteClasse.set(contexte);
    }
  }

  ngOnInit(): void {
    this.chargerLesDonneesEleves();
  }


  getDateLocale(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  chargerAppelDuJour(): void {
    const courseId = this.courseId;
    if (!courseId) {
      console.warn('Impossible de charger l’appel : courseId absent.');
      this.attendancesDuJour.set([]);
      this.isLoadingAppel.set(false);
      return;
    }

    const attendanceDate = this.getDateLocale();

    this.isLoadingAppel.set(true);

    this.dossierResource.getAppelDuJour(courseId, attendanceDate).subscribe({
      next: (response: any) => {
        const attendances: AttendanceRecordResponse[] =
          Array.isArray(response)
            ? response
            : [];

        this.attendancesDuJour.set(attendances);

        if (attendances.length > 0) {
          this.appliquerAttendancesDuJour(attendances);
        }

        this.isLoadingAppel.set(false);
      },

      error: (error: any) => {
        console.error('Erreur récupération des attendances du jour :', error);

        this.attendancesDuJour.set([]);
        this.isLoadingAppel.set(false);
      }
    });
  }

  appliquerAttendancesDuJour(attendances: AttendanceRecordResponse[]): void {
    const attendanceParEleve = new Map(
      attendances.map(attendance => [
        attendance.eleveId,
        attendance
      ])
    );

    this.eleves.update(eleves => eleves.map(eleve => {

      const attendance = attendanceParEleve.get(eleve.id);

      if (!attendance) {
        return eleve;
      }

      return {
        ...eleve,

        attendanceStatus: attendance.status,
        motif: attendance.justificationReason ?? undefined,
        justified: attendance.justified ?? false,
        arrivalTime: attendance.arrivalTime
          ? attendance.arrivalTime.substring(0, 5)
          : undefined,
        lateMinutes: attendance.lateMinutes ?? undefined
      };
    })
    );
  }

  async chargerLesAttendances() {
    try {
      this.chargerLesDonneesAttendances(false);

    } catch (error) {

      console.error('Erreur chargement données:', error);
    }
  }

  getSessionSemestreList(): Promise<SessionSemestre[]> {
    return new Promise(
      (resolve, reject) => {

        this.planification.getResourceListe('referentiel/sessionsemestre')
          .subscribe({

            next: (data: any) => {
              this.sessionSemestreList = data;
              resolve(data);
            },

            error: (err: any) => reject(err)

          });
      }
    );
  }

  getEvaluationsList(): Promise<EvaluationEditRequest[]> {
    return new Promise(
      (resolve, reject) => {
        this.planification.getResourceListByElement('evaluation/listclasse', Number(this.classeId))
          .subscribe({
            next: (data: any) => {

              this.evaluationForNotes = data;
              resolve(data);
            },

            error: (err: any) => reject(err)

          });
      }
    );
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

  chargerLesDonneesAttendances(useFilterApi: boolean) {
    this.isLoading = true;
    let apiCall;

    if (useFilterApi) {
      const filtreParam = this.construireParametreDeFiltreEvaluation();

      apiCall = this.planification.fetchFilterDataTable(
        'evaluation/classe',
        this.currentPage,
        this.pageSize,
        filtreParam
      );

    } else {

      apiCall = this.planification.getResourceByIdPaged(
        'attendancerecord/cours',
        Number(this.courseId),
        this.currentPage,
        this.pageSize
      );
    }

    apiCall.subscribe({

      next: (response) => {
        this.attendanceData = response.data?.content || [];
        this.totalElements = response.data?.totalElements || 0;

        this.attendanceData = this.attendanceData?.map(
          (item: any) => ({
            ...item
          })
        );

        this.columns = [
          {
            key: 'nomCompletEleve',
            header: 'Elève'
          },
          {
            key: 'attendanceDate',
            header: 'Date'
          },
          {
            key: 'sessionSemestre',
            header: 'Semestre'
          },
          {
            key: 'attendanceStatus',
            header: 'Status'
          },
          {
            key: 'lateMinutes',
            header: 'Laste minute'
          },
          {
            key: 'justified',
            header: 'Etat'
          },
          {
            key: 'course',
            header: 'Cours'
          }
        ];
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }

    });
  }

  getMoisList(): Promise<any[]> {
    return new Promise(
      (resolve, reject) => {

        this.commonService.getAllMois().subscribe({

          next: (data) => {
            this.moisList = data;
            resolve(data);
          },
          error: (err) => reject(err)
        });
      }
    );
  }

  initialisationDesFiltres() {

    this.tableFilters = [

      {
        key: 'sessionSemestre',
        label: 'Semestre',
        type: 'select',
        options: this.sessionSemestreList.map(
          s => ({
            value: s.id,
            label: `${s.semestre}`
          })
        )
      },

      {
        key: 'mois',
        label: 'Mois',
        type: 'select',
        options: this.moisList.map(
          m => ({
            value: m.id,
            label: m.mois
          })
        )
      }

    ];
  }


  changeSize(size: number | string) {
    const newSize = typeof size === 'string' ? parseInt(size, 10) : size;

    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.chargerLesDonneesAttendances(this.hasActiveFilters);
    }
  }

  onFilterChange(filter: IFilterConfig, value: any) {
    this.activeFilters[filter.key] = value;
    this.hasActiveFilters = Object.values(this.activeFilters).some(
      val =>
        val !== null &&
        val !== undefined &&
        val !== ''
    );

    this.currentPage = 0;
    this.chargerLesDonneesAttendances(this.hasActiveFilters);
  }

  changePage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.currentPage = pageNumber;
      this.chargerLesDonneesAttendances(this.hasActiveFilters);
    }
  }

  resetFilters() {
    this.activeFilters = {};
    this.hasActiveFilters = false;
    this.initialisationDesFiltres();
    this.currentPage = 0;
    this.chargerLesDonneesAttendances(false);
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

  changerOnglet(onglet: string): void {
    this.activeTab.set(onglet);
    if (this.activeTab() === 'notes') {
      void this.getEvaluationsList();
    }
  }

  get totalAbsents(): number {
    return this.eleves().filter(e => e.attendanceStatus === 'ABSENCE').length;
  }

  get totalPresents(): number {
    return this.eleves().filter(e => e.attendanceStatus === 'PRESENCE').length;
  }

  get totalRetards(): number {
    return this.eleves().filter(e => e.attendanceStatus === 'RETARD').length;
  }

  changerStatutEleve(eleve: Eleve, status: AttendanceStatus): void {

    if (this.appelDejaEffectue()) {
      this.toastService.warning("L'appel a déjà été effectué pour ce cours aujourd'hui.");
      return;
    }

    this.eleves.update(eleves => eleves.map(
      e => {
        if (
          e.id !== eleve.id
        ) {
          return e;
        }

        return {

          ...e,
          attendanceStatus: status,
          motif: status === 'ABSENCE' ||
            status === 'RETARD'

            ? e.motif

            : undefined,

          justified: status === 'ABSENCE'

            ? e.justified ?? false

            : false,

          lateMinutes: status === 'RETARD'

            ? e.lateMinutes

            : undefined,

          arrivalTime: status === 'RETARD'

            ? e.arrivalTime

            : undefined

        };

      }
    )
    );
  }

  modifierMotif(eleve: Eleve, motif: string): void {
    if (this.appelDejaEffectue()) {
      return;
    }

    this.eleves.update(eleves =>
      eleves.map(
        e =>
          e.id === eleve.id

            ? {
              ...e,
              motif
            }

            : e
      )
    );
  }

  modifierMinutesRetard(eleve: Eleve, minutes: number | string): void {
    if (this.appelDejaEffectue()) {
      return;
    }

    const lateMinutes = minutes === ''
      ? undefined
      : Number(minutes);

    this.eleves.update(eleves =>
      eleves.map(
        e =>
          e.id === eleve.id

            ? {
              ...e,
              lateMinutes
            }

            : e
      )
    );
  }

  get courseId(): number | undefined {
    return this.contexteClasse()?.courseId;
  }

  get heureDebutCours(): string | undefined {
    return this.contexteClasse()?.heureDebut;
  }

  chargerLesDonneesEleves(): void {
    const contexte = this.contexteClasse();
    const classeId = contexte?.classId ?? this.classeId;
    const anneeScolaireId = contexte?.anneeScolaireId;

    if (!classeId) {
      this.toastService.error(
        'Impossible de déterminer la classe.'
      );
      return;
    }

    if (!anneeScolaireId) {
      this.toastService.error(
        'Impossible de déterminer l’année scolaire.'
      );
      return;
    }

    this.isLoadingEleves.set(true);

    const endpoint = `inscription/classe/${classeId}/annee-scolaire/${anneeScolaireId}/eleves`;

    this.dossierResource.getResourceList(endpoint).subscribe({
      next: (response: any) => {

        console.log(
          'Response élèves :',
          response
        );

        const inscriptions = response?.data ??
          response ??
          [];


        if (
          !Array.isArray(inscriptions)
        ) {

          this.eleves.set([]);

          this.elevesInscrits.set([]);

          this.isLoadingEleves.set(
            false
          );

          return;
        }


        const elevesInscrits:
          EleveInscritClasse[] =

          inscriptions.map(
            (inscription: any) => ({

              inscriptionId:
                inscription.inscriptionId,

              eleveId:
                inscription.eleveId,

              nom:
                inscription.nom ?? '',

              prenom:
                inscription.prenom ?? '',

              nomComplet:
                inscription.nomComplet ?? '',

              sexe:
                inscription.sexe === 'Féminin'
                  ? 'F'
                  : 'M',

              classeId:
                inscription.classeId,

              anneeScolaireId:
                inscription.anneeScolaireId,

              attendanceStatus:
                'PRESENCE',

              justified:
                false

            })
          );


        this.elevesInscrits.set(elevesInscrits);

        const eleves: Eleve[] =
          elevesInscrits.map(
            inscription => ({
              id: inscription.eleveId,
              inscriptionId: inscription.inscriptionId,
              nom: inscription.nom,
              prenom: inscription.prenom,
              sexe: inscription.sexe,
              attendanceStatus: 'PRESENCE',
              justified: false
            })
          );

        this.eleves.set(eleves);

        this.isLoadingEleves.set(false);

        this.chargerAppelDuJour();
      },


      error: (error: any) => {

        console.error(
          'Erreur chargement des élèves inscrits :',
          error
        );


        this.eleves.set([]);

        this.elevesInscrits.set([]);

        this.isLoadingEleves.set(
          false
        );


        this.toastService.error(
          error?.error?.message ??
          'Impossible de charger les élèves inscrits de la classe.'
        );
      }

    });
  }

  changerVueAppel(vue: 'faire-appel' | 'historique'): void {
    this.activeAppelView.set(vue);
    if (vue === 'historique') {
      this.chargerLesAttendances();
    }
  }

  modifierHeureArrivee(eleve: Eleve, arrivalTime: string): void {
    if (this.appelDejaEffectue()) {
      return;
    }
    const heureDebut = this.heureDebutCours;

    if (!heureDebut || !arrivalTime) {
      return;
    }

    const [debutHeure, debutMinute] = heureDebut.substring(0, 5).split(':').map(Number);
    const [arriveeHeure, arriveeMinute] = arrivalTime.substring(0, 5).split(':').map(Number);
    const debut = debutHeure * 60 + debutMinute;
    const arrivee = arriveeHeure * 60 + arriveeMinute;

    const lateMinutes = Math.max(0, arrivee - debut);

    this.eleves.update(eleves =>
      eleves.map(
        e =>
          e.id === eleve.id
            ? {
              ...e,
              arrivalTime,
              lateMinutes
            }
            : e
      )
    );
  }

  sauvegarderAppel(): void {
    if (this.appelDejaEffectue()) {
      this.toastService.warning("L'appel a déjà été effectué pour ce cours aujourd'hui.");
      return;
    }

    const courseId = this.courseId;
    const contexte = this.contexteClasse();

    if (!courseId) {
      this.toastService.error(
        'Impossible de déterminer le cours concerné.'
      );
      return;
    }
    const anneeScolaireId = contexte?.anneeScolaireId;

    if (!anneeScolaireId) {
      this.toastService.error('Impossible de déterminer l’année scolaire.');
      return;
    }

    if (this.eleves().length === 0) {
      this.toastService.error('Aucun élève à enregistrer.');
      return;
    }

    const absenceSansMotif = this.eleves().find(eleve =>
      eleve.attendanceStatus === 'ABSENCE' && !eleve.motif?.trim()
    );

    if (absenceSansMotif) {
      this.toastService.error(
        `Veuillez renseigner le motif d'absence de ${absenceSansMotif.prenom} ${absenceSansMotif.nom}.`
      );

      return;
    }

    const retardSansHeureArrivee = this.eleves().find(eleve => eleve.attendanceStatus === 'RETARD' && !eleve.arrivalTime);

    if (retardSansHeureArrivee) {
      this.toastService.error(
        `Veuillez renseigner l'heure d'arrivée de ${retardSansHeureArrivee.prenom} ${retardSansHeureArrivee.nom}.`
      );

      return;
    }

    const retardSansMinutes = this.eleves().find(eleve =>
      eleve.attendanceStatus === 'RETARD' &&
      (
        eleve.lateMinutes === undefined ||
        eleve.lateMinutes <= 0
      )
    );


    if (retardSansMinutes) {

      this.toastService.error(
        `L'heure d'arrivée de ${retardSansMinutes.prenom} ${retardSansMinutes.nom} ne génère aucun retard.`
      );

      return;
    }

    const attendanceDate = this.getDateLocale();

    const request: FaireAppelRequest = {
      courseId,
      anneeScolaireId: Number(anneeScolaireId),
      attendanceDate,
      presences:
        this.eleves().map(
          eleve => {
            const presence: AttendanceRecordRequest = {
              eleveId: eleve.id,
              status: eleve.attendanceStatus
            };

            if (eleve.attendanceStatus === 'ABSENCE') {
              presence.justified = eleve.justified ?? false;
              presence.justificationReason = eleve.motif?.trim() || undefined;
            }

            if (eleve.attendanceStatus === 'RETARD') {
              presence.arrivalTime = eleve.arrivalTime;
              presence.lateMinutes = eleve.lateMinutes;
              presence.justificationReason = eleve.motif?.trim() || undefined;
            }

            return presence;
          }
        )
    };

    console.log('Payload Faire appel :', JSON.stringify(request, null, 2));

    this.isSavingAppel.set(true);

    this.dossierResource.faireAppel(request).subscribe({
      next: (response: any) => {
        const attendances: AttendanceRecordResponse[] =
          Array.isArray(response?.data) ? response.data : [];

        this.attendancesDuJour.set(attendances);

        if (attendances.length > 0) {
          this.appliquerAttendancesDuJour(attendances);
        }
        this.isSavingAppel.set(false);

        this.toastService.success(
          'L’appel a été enregistré avec succès.'
        );

        this.activeAppelView.set('faire-appel');

        this.chargerAppelDuJour();
      },

      error: (error: any) => {
        this.isSavingAppel.set(false);

        console.error(
          'Erreur lors de l’enregistrement de l’appel',
          error
        );

        this.toastService.error(
          error?.error?.message ?? 'Une erreur est survenue lors de l’enregistrement de l’appel.'
        );
      }

    });
  }

  creerExercice(): void {
    void this.router.navigate(['/enseignant/exercice/create']);
  }

  creerEvaluation(): void {
    void this.router.navigate(['/enseignant/evaluation']);
  }

  onEvaluationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const evaluationId = Number(select.value);

    const evaluationComplete = this.evaluationForNotes.find(e => e.id === evaluationId);

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
    const notesFormatees: NoteSaisie[] =
      listeNotes.map((note: any) => ({
        id: note.id,
        eleve: note.eleve,
        nomComplet: note.nomCompletEleve ?? `Élève ${note.eleve}`,
        note: note.note ?? null,
        appreciation: note.appreciation ?? ''
      })
      );

    this.notesData.set(notesFormatees);

    this.calculerStatistiques();

    console.log('Évaluation sélectionnée :', evaluation);

    console.log('Notes chargées :', this.notesData());
  }

  calculerStatistiques(): void {
    const notes = this.notesData();

    const notesValues = notes.map(n => n.note).filter(
      (note): note is number =>
        note !== null &&
        note !== undefined &&
        !Number.isNaN(
          Number(note)
        )
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

      this.toastService.warning(
        'Veuillez d’abord sélectionner une évaluation.'
      );

      return;
    }

    const evaluation = this.selectedEvaluationForNotes as EvaluationEditRequest;
    const noteMax = 20;
    const evaluationId = Number(evaluation.id);
    const noteInvalide = this.notesData().find(note =>
      note.note !== null &&
      (Number.isNaN(Number(note.note)) ||
        Number(note.note) < 0 ||
        Number(note.note) > noteMax
      )
    );

    if (noteInvalide) {

      this.toastService.error(
        `La note de ${noteInvalide.nomComplet} doit être comprise entre 0 et ${noteMax}.`
      );

      return;
    }

    const noteEditRequestDTOList = this.notesData().map(
      note => {
        const noteOriginale =
          (
            evaluation.noteEditRequestDTOList ??
            []
          ).find(
            (n: any) =>
              n.id === note.id
          );

        return {
          id: note.id,
          eleve: Number(note.eleve),
          nomCompletEleve: noteOriginale?.nomCompletEleve ?? note.nomComplet,
          note: note.note !== null ? Number(note.note) : null,
          type: evaluation.evaluationType,
          dateCreation: noteOriginale?.dateCreation ?? null,
          appreciation: note.appreciation ?? '',
          actif: noteOriginale?.actif ?? 1
        };
      }
    );

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

    console.log(
      'Payload UPDATE évaluation + notes :',
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    this.isSavingNotes = true;

    this.dossierResource.updateNotesEvaluationsReource(
      'evaluation',
      evaluationId,
      payload
    )
      .subscribe({

        next: (response: any) => {

          this.isSavingNotes = false;

          this.toastService.success(
            `Les notes de "${evaluation.titre}" ont été enregistrées avec succès.`
          );

          this.getEvaluationsList()
            .then(
              () => {

                const evaluationUpdated = this.evaluationForNotes.find(e => e.id === evaluation.id);

                if (evaluationUpdated) {
                  this.selectedEvaluationForNotes = evaluationUpdated;
                  this.loadNotesFromEvaluation(evaluationUpdated);
                }
              }
            );
        },

        error: (error: any) => {
          this.isSavingNotes = false;
          console.error(
            'Erreur lors de la sauvegarde des notes :',
            error
          );

          this.toastService.error(
            error?.error?.message ??
            'Une erreur est survenue lors de l’enregistrement des notes.'
          );
        }

      });
  }

  today(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    return new Date().toLocaleDateString('fr-FR', options);
  }
}
