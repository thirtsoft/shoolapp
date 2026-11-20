import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EvaluationDetailResponse, NoteEvaluationResponse } from '../../../../../../core/models/dossiereleve/evaluation/evaluation-details-response';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';
import { firstValueFrom } from 'rxjs';

declare const pdfMake: any;

interface PageNotes {
  content: NoteEvaluationResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface DocumentEvaluation {
  documentUuid?: string;
  nomFichier?: string;
  typeDocument?: string;
  available?: boolean;
}

interface WorkflowStep {
  label: string;
  date?: string;
  author?: string;
  active?: boolean;
}

@Component({
  selector: 'app-details-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './details-evaluation.component.html',
  styleUrls: ['./details-evaluation.component.css']
})
export class DetailsEvaluationComponent implements OnInit {

  errorMessage?: string;

  evaluationId?: number;

  isEdit = false;
  isEditMode = false;

  title = 'Détails évaluation';

  disableAddButton = false;

  logoPreview: string | null = null;

  loading = signal(false);

  organizationData: OrganizationMiniResponse = {};

  error = signal('');

    private readonly pdfColors = {
    navy: '#12386B',
    blue: '#2F6FB5',
    text: '#1F2A44',
    muted: '#6B7A90',
    softBg: '#EAF2FB',
    border: '#D6E4F2',
    waveLight: '#DCEBFA',
    white: '#FFFFFF',
    danger: '#B42318',
    success: '#027A48'
  };


  private readonly modalService = inject(NgbModal);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router)


  /**
   * Mode édition des notes.
   */
  modeEdition = false;


  /**
   * Recherche élève.
   */
  recherche = '';


  /**
   * Pagination fournie par l'API.
   */
  pageCourante = 1;

  readonly taillePage = 10;


  /**
   * Réponse complète de l'API.
   */
  detailsEvaluation: EvaluationDetailResponse = {};


  /**
   * Notes actuellement affichées.
   */
  notes: NoteEvaluationResponse[] = [];


  /**
   * Copie de sécurité avant modification.
   */
  private notesAvantModification: NoteEvaluationResponse[] = [];


  /**
   * Documents retournés par l'API.
   */
  documents: DocumentEvaluation[] = [];


  /**
   * Workflow construit à partir des dates retournées
   * par l'API.
   */
  workflowSteps: WorkflowStep[] = [];


  ngOnInit(): void {

    this.loadOrganizationInfos();

    this.evaluationId = Number(
      this.activeRoute.snapshot.params['id']
    );

    if (
      this.evaluationId !== null &&
      this.evaluationId !== undefined &&
      !Number.isNaN(this.evaluationId)
    ) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }


  private loadOrganizationInfos(): void {

    const organizationUuid =
      localStorage.getItem('v2_organization_uuid');

    if (!organizationUuid) {

      this.error.set('Organisation non trouvée');
      this.loading.set(false);

      this.toastService.warning(
        'Attention',
        'Organisation non trouvée'
      );

      return;
    }

    this.loading.set(true);

    this.organizationConfigService
      .getOrganizationConfigInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (response: any) => {

          this.organizationData = response;

          this.loadLogo(this.organizationData);

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Erreur chargement organisation:',
            error
          );

          this.toastService.error(
            'Erreur',
            'Impossible de charger les informations'
          );

          this.loading.set(false);
        }
      });
  }


  private loadLogo(
    organization: OrganizationMiniResponse
  ): void {

    this.logoPreview = null;

    if (
      !organization.logo?.available ||
      !organization.logo.logoUuid
    ) {
      return;
    }

    this.organizationConfigService
      .getLogoContent(organization.logo.logoUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (blob: Blob) => {

          this.logoPreview =
            URL.createObjectURL(blob);
        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement du logo :',
            error
          );

          this.logoPreview = null;
        }
      });
  }

  
  private async getOrganizationLogoBase64(): Promise<string | null> {
    const logoUuid = this.organizationData?.logo?.logoUuid;
    if (!this.organizationData?.logo?.available || !logoUuid) {
      return null;
    }

    try {
      const blob = await firstValueFrom(this.organizationConfigService.getLogoContent(logoUuid));

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error(
        'Impossible de récupérer le logo de l’organisation pour le PDF :',
        error
      );
      return null;
    }
  }

  private async getScoolliLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/scoolli-logo.png');
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result as string);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Impossible de charger le logo Scoolli :', error);
      return null;
    }
  }



  /**
   * Récupération des détails depuis l'API.
   */
  getDetailsEvaluation(evalId: number): void {

    this.loading.set(true);

    this.dossierResource
      .getDetailsEvaluation(evalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: EvaluationDetailResponse) => {

          this.detailsEvaluation = data;

          this.initialiserNotes(data);

          this.initialiserDocuments(data);

          this.initialiserWorkflow(data);

          this.pageCourante =
            (data.notes?.number ?? 0) + 1;

          this.loading.set(false);

          console.log(
            'evaluation',
            this.detailsEvaluation
          );
        },

        error: (error: any) => {

          console.error(
            'Erreur récupération évaluation :',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            error?.error ??
            'Impossible de récupérer les informations de l’évaluation.';

          this.toastService.error(
            'Erreur',
            this.errorMessage
          );

          this.loading.set(false);
        }
      });
  }


  private initialiserNotes(data: EvaluationDetailResponse): void {

    const page = data.notes as unknown as PageNotes | undefined;

    this.notes = page?.content ?? [];
  }


  /**
   * Documents retournés par l'API.
   */
  private initialiserDocuments(
    data: EvaluationDetailResponse
  ): void {

    this.documents =
      (data.documents ?? []) as unknown as DocumentEvaluation[];
  }


  /**
   * Construction du workflow à partir des dates
   * présentes dans EvaluationDetailResponse.
   */
  private initialiserWorkflow(
    data: EvaluationDetailResponse
  ): void {

    this.workflowSteps = [

      {
        label: 'Brouillon',
        date: this.formaterDateWorkflow(
          data.dateCreation
        ),
        active: !!data.dateCreation
      },

      {
        label: 'Planifiée',
        date: this.formaterDateWorkflow(
          data.datePlanification
        ),
        active: !!data.datePlanification
      },

      {
        label: 'Passée',
        date: this.formaterDateWorkflow(
          data.datePassage
        ),
        active: !!data.datePassage
      },

      {
        label: 'En cours de correction',
        date: this.formaterDateWorkflow(
          data.dateDebutCorrection
        ),
        active: !!data.dateDebutCorrection
      },

      {
        label: 'Terminée',
        date: this.formaterDateWorkflow(
          data.dateTerminee
        ),
        active: !!data.dateTerminee
      }
    ];
  }


  /**
   * Formate une date ISO pour l'affichage du workflow.
   */
  private formaterDateWorkflow(
    date?: string | null
  ): string {

    if (!date) {
      return '';
    }

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
      return '';
    }

    return valeur.toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }


  /**
   * Notes filtrées par la recherche.
   *
   * La pagination est déjà réalisée côté backend.
   * La recherche s'applique donc à la page actuellement
   * reçue par l'API.
   */
  get notesFiltrees(): NoteEvaluationResponse[] {

    const recherche =
      this.recherche.trim().toLowerCase();

    if (!recherche) {
      return this.notes;
    }

    return this.notes.filter(note => {

      const nom =
        note.nomComplet?.toLowerCase() ?? '';

      const matricule =
        note.matricule?.toLowerCase() ?? '';

      return (
        nom.includes(recherche) ||
        matricule.includes(recherche)
      );
    });
  }


  /**
   * Nombre total d'élèves de l'évaluation.
   */
  get nombreEleves(): number {

    return this.detailsEvaluation.nombreEleves ?? 0;
  }


  /**
   * Nombre de copies saisies.
   */
  get copiesSaisies(): number {

    return this.detailsEvaluation.nombreCopiesSaisies ?? 0;
  }


  /**
   * Nombre d'absences.
   */
  get nombreAbsents(): number {

    return this.detailsEvaluation.nombreAbsences ?? 0;
  }


  /**
   * Moyenne.
   */
  get moyenne(): number {

    return this.detailsEvaluation.moyenne ?? 0;
  }


  /**
   * Note minimale.
   */
  get noteMinimale(): number {

    return this.detailsEvaluation.noteMin ?? 0;
  }


  /**
   * Note maximale.
   */
  get noteMaximale(): number {

    return this.detailsEvaluation.noteMax ?? 0;
  }


  /**
   * Pourcentage de copies saisies.
   *
   * Calcul uniquement à partir des statistiques
   * retournées par l'API.
   */
  get pourcentageCopies(): number {

    if (!this.nombreEleves) {
      return 0;
    }

    return Math.round(
      (this.copiesSaisies / this.nombreEleves) * 100
    );
  }


  /**
   * Total d'élèves correspondant à la recherche.
   */
  get totalElevesFiltres(): number {

    return this.notesFiltrees.length;
  }


  /**
   * Total de pages retourné par l'API.
   */
  get nombrePages(): number {

    const page =
      this.detailsEvaluation.notes as unknown as PageNotes | undefined;

    return Math.max(
      1,
      page?.totalPages ?? 1
    );
  }


  /**
   * Index de début de la page API.
   */
  get debutPagination(): number {

    const page =
      this.detailsEvaluation.notes as unknown as PageNotes | undefined;

    return (page?.number ?? 0) * (page?.size ?? this.taillePage);
  }


  /**
   * Index de fin.
   */
  get finPagination(): number {

    const page =
      this.detailsEvaluation.notes as unknown as PageNotes | undefined;

    const debut =
      this.debutPagination;

    const nombre =
      page?.numberOfElements ??
      this.notes.length;

    return debut + nombre;
  }


  /**
   * Pages affichées.
   */
  get pages(): number[] {

    return Array.from(
      {
        length: this.nombrePages
      },
      (_, index) => index + 1
    );
  }


  /**
   * Recherche.
   */
  rechercher(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.recherche =
      input.value;
  }


  /**
   * Efface la recherche.
   */
  effacerRecherche(): void {

    this.recherche = '';
  }


  /**
   * Pagination.
   *
   * Important : le changement de page nécessite
   * que getDetailsEvaluation accepte ensuite le numéro
   * de page côté service/API.
   *
   * Pour l'instant on ne simule pas une pagination
   * côté frontend.
   */
  allerPage(page: number): void {

    if (
      page < 1 ||
      page > this.nombrePages ||
      page === this.pageCourante
    ) {
      return;
    }

    this.pageCourante = page;

    // À brancher lorsque le service Angular exposera :
    // getDetailsEvaluation(evalId, page - 1, this.taillePage)
  }


  pagePrecedente(): void {

    if (this.pageCourante > 1) {
      this.allerPage(
        this.pageCourante - 1
      );
    }
  }


  pageSuivante(): void {

    if (
      this.pageCourante <
      this.nombrePages
    ) {
      this.allerPage(
        this.pageCourante + 1
      );
    }
  }


  /**
   * Une note null signifie ABSENT.
   * Une note 0 signifie PRESENT avec note zéro.
   */
  getStatutNote(
    note: NoteEvaluationResponse
  ): 'PRESENT' | 'ABSENT' {

    return note.note === null ||
      note.note === undefined
      ? 'ABSENT'
      : 'PRESENT';
  }


  /**
   * Active le mode modification.
   */
  activerEdition(): void {

    this.notesAvantModification =
      structuredClone(this.notes);

    this.modeEdition = true;
  }


  /**
   * Annule les modifications locales.
   */
  annulerModification(): void {

    this.notes =
      structuredClone(
        this.notesAvantModification
      );

    this.modeEdition = false;
  }


  /**
   * Modification d'une note.
   *
   * Une cellule vide signifie ABSENT => note null.
   * 0 reste une vraie note.
   */
  modifierNote(
    noteEvaluation: NoteEvaluationResponse,
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const valeur =
      input.value.trim();

    if (valeur === '') {

      noteEvaluation.note = null;

      return;
    }

    let note =
      Number(valeur);

    if (Number.isNaN(note)) {
      return;
    }

    if (note < 0) {
      note = 0;
    }

    if (note > 20) {
      note = 20;
    }

    noteEvaluation.note = note;
  }


  /**
   * Modification du statut.
   *
   * ABSENT => note null
   * PRESENT => conserve la note existante.
   */
  modifierStatut(
    noteEvaluation: NoteEvaluationResponse,
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    if (select.value === 'ABSENT') {

      noteEvaluation.note = null;

      return;
    }

    if (
      noteEvaluation.note === null ||
      noteEvaluation.note === undefined
    ) {
      noteEvaluation.note = 0;
    }
  }


  /**
   * Modification de l'appréciation.
   */
  modifierObservation(
    noteEvaluation: NoteEvaluationResponse,
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    noteEvaluation.appreciation =
      input.value;
  }


  /**
   * Enregistre les notes.
   *
   * L'appel backend de modification reste à brancher
   * lorsque la méthode du service Angular correspondante
   * sera disponible.
   */
  enregistrerNotes(): void {

    console.log(
      'Notes à enregistrer :',
      this.notes
    );

    /*
     * Exemple :
     *
     * this.dossierResource
     *   .modifierNotesEvaluation(
     *      this.evaluationId!,
     *      this.notes
     *   )
     *   .subscribe({
     *      next: () => {
     *        this.modeEdition = false;
     *        this.getDetailsEvaluation(
     *          this.evaluationId!
     *        );
     *      }
     *   });
     */

    this.modeEdition = false;
    this.notesAvantModification = [];
  }


  /**
   * Modification de l'évaluation.
   */
  modifierEvaluation(): void {

    console.log(
      'Ouverture de la modification de l’évaluation'
    );
  }


  /**
   * Impression.
   */
  imprimerFeuille(): void {

    window.print();
  }


  /**
   * Consultation d'un document.
   */
  consulterDocument(
    document: DocumentEvaluation
  ): void {

    console.log(
      'Consultation du document :',
      document
    );
  }


  /**
   * Téléchargement d'un document.
   */
  telechargerDocument(
    document: DocumentEvaluation
  ): void {

    console.log(
      'Téléchargement du document :',
      document
    );
  }


  /**
   * Ajout d'un document.
   */
  ajouterDocument(): void {

    console.log(
      'Ouverture de la fenêtre d’ajout de document'
    );
  }

   async imprimerUneEvaluation(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error('Erreur', 'Aucune évaluation à imprimer.');
      return;
    }

    const document = await this.getDocumentEvaluation();
    pdfMake.createPdf(document).print();
  }

  async telechargerEvaluationPdf(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error('Erreur', 'Aucune évaluation à télécharger.');
      return;
    }
    const document = await this.getDocumentEvaluation();
    const numero = this.detailsEvaluation.numeroEvaluation || 'evaluation';

    pdfMake.createPdf(document).download(`${numero}.pdf`);
  }


  async getDocumentEvaluation(): Promise<any> {
    const c = this.pdfColors;
    const evaluation = this.detailsEvaluation;

    if (!evaluation) {
      throw new Error('Aucune évaluation à imprimer.');
    }

    const notes = this.notesFiltrees ?? [];
    const etablissement = this.organizationData;

    const organizationLogoBase64 = await this.getOrganizationLogoBase64();
    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();

    const pageSize = { width: 595.28, height: 841.89 };

    const formatDate = (value: any): string => {
      if (!value) return '—';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    const formatHeure = (value: string | null | undefined): string => {
      if (!value) return '—';
      return value.substring(0, 5);
    };

    const valeur = (value: any): string =>
      value !== null && value !== undefined && value !== ''
        ? String(value)
        : '—';

    const lignesNotes = notes.map((detail: any, index: number) => [
      {
        text: String(index + 1),
        alignment: 'center'
      },
      {
        text: valeur(detail.matricule),
        alignment: 'center'
      },
      {
        text: valeur(detail.nomComplet)
      },
      {
        text: detail.note !== null && detail.note !== undefined
          ? String(detail.note)
          : '—',
        alignment: 'center',
        bold: true
      },
      {
        text: valeur(detail.appreciation)
      }
    ]);

    const nomEtablissement = etablissement?.libelle ?? 'Établissement scolaire';

    const informationsEtablissement = [
      etablissement?.adresse,
      etablissement?.telephone,
      etablissement?.email
    ].filter((element: any) => !!element);

    const bodyNotes = [
      [
        { text: 'N°', style: 'tableHeader', alignment: 'center' },
        { text: 'MATRICULE', style: 'tableHeader', alignment: 'center' },
        { text: 'NOM ET PRÉNOM', style: 'tableHeader' },
        { text: 'NOTE', style: 'tableHeader', alignment: 'center' },
        { text: 'APPRÉCIATION', style: 'tableHeader' }
      ],
      ...lignesNotes
    ];

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [35, 35, 35, 55],

      background: () => ({
        canvas: this.buildWave(pageSize.width, pageSize.height)
      }),

      header: () => ({
        margin: [35, 18, 35, 0],
        columns: [
          {
            width: '*',
            stack: [
              {
                text: nomEtablissement,
                bold: true,
                fontSize: 13,
                color: c.navy
              },
              {
                text: informationsEtablissement.join(' | ') || ' ',
                fontSize: 8,
                color: c.muted,
                margin: [0, 3, 0, 0]
              }
            ]
          },
          ...(logo
            ? [{
              image: logo,
              width: 48,
              height: 42,
              fit: [48, 42],
              alignment: 'right' as const
            }]
            : [])
        ]
      }),

      content: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 525,
              y2: 0,
              lineWidth: 2,
              lineColor: c.blue
            }
          ],
          margin: [0, 8, 0, 16]
        },

        {
          text: 'FICHE D’ÉVALUATION',
          fontSize: 19,
          bold: true,
          color: c.navy,
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },

        {
          text: valeur(evaluation.numeroEvaluation),
          fontSize: 10,
          color: c.muted,
          alignment: 'center',
          margin: [0, 0, 0, 18]
        },

        // Informations générales de l'évaluation
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Titre', style: 'label' },
                { text: valeur(evaluation.titre), style: 'value' }
              ],
              [
                { text: 'Description', style: 'label' },
                { text: valeur(evaluation.description), style: 'value' }
              ],
              [
                { text: 'Matière', style: 'label' },
                { text: valeur(evaluation.evaluationInformationsResponse?.matiereLibelle), style: 'value' }
              ],
              [
                { text: 'Classe', style: 'label' },
                { text: valeur(evaluation.evaluationInformationsResponse?.classeLibelle), style: 'value' }
              ],
              [
                { text: 'Année scolaire', style: 'label' },
                { text: valeur(evaluation.evaluationInformationsResponse?.anneeScolaireLibelle), style: 'value' }
              ],
              [
                { text: 'Enseignant(e)', style: 'label' },
                { text: valeur(evaluation.evaluationInformationsResponse?.enseignantNomComplet), style: 'value' }
              ],
              [
                { text: 'Type', style: 'label' },
                { text: valeur(evaluation.typeEvaluation), style: 'value' }
              ],
              [
                { text: 'Mode', style: 'label' },
                { text: valeur(evaluation.evaluationMode), style: 'value' }
              ],
              [
                { text: 'État', style: 'label' },
                { text: valeur(evaluation.etat), style: 'value' }
              ],
              [
                { text: 'Date de l’évaluation', style: 'label' },
                { text: formatDate(evaluation.dateEvaluation), style: 'value' }
              ],
              [
                { text: 'Horaire', style: 'label' },
                {
                  text: `${formatHeure(evaluation.heureDebut)} - ${formatHeure(evaluation.heureFin)}`,
                  style: 'value'
                }
              ],
              [
                { text: 'Date de remise', style: 'label' },
                { text: formatDate(evaluation.datePassage), style: 'value' }
              ],
              [
                { text: 'Session / semestre', style: 'label' },
                {
                  text: evaluation.evaluationInformationsResponse?.sessionSemestreLibelle,
                  style: 'value'
                }
              ]
            ]
          },
          layout: {
            hLineColor: () => c.border,
            vLineColor: () => c.border,
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6
          },
          margin: [0, 0, 0, 20]
        },

        {
          text: 'RÉSULTATS DES ÉLÈVES',
          fontSize: 12,
          bold: true,
          color: c.navy,
          margin: [0, 0, 0, 9]
        },

        {
          text: `Nombre de notes retournées : ${notes.length}`,
          fontSize: 9,
          color: c.muted,
          margin: [0, 0, 0, 8]
        },

        {
          table: {
            headerRows: 1,
            widths: [25, 82, '*', 45, 95],
            body: bodyNotes
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? c.navy
                : rowIndex % 2 === 0
                  ? c.softBg
                  : null,
            hLineColor: () => c.border,
            vLineColor: () => c.border,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 7,
            paddingBottom: () => 7
          }
        },

        {
          text: 'Signature de l’enseignant(e)',
          bold: true,
          fontSize: 10,
          color: c.navy,
          alignment: 'right',
          margin: [0, 45, 10, 0]
        },

        {
          text: valeur(evaluation.evaluationInformationsResponse?.enseignantNomComplet),
          fontSize: 9,
          alignment: 'right',
          margin: [0, 8, 10, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => ({
        margin: [35, 10, 35, 15],
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 525,
                y2: 0,
                lineWidth: 0.7,
                lineColor: c.border
              }
            ]
          },
          {
            columns: [
              {
                text: 'Document généré avec Scoolli · scoolli.com',
                fontSize: 8,
                color: c.muted,
                margin: [0, 6, 0, 0]
              },
              {
                text: `Page ${currentPage} / ${pageCount}`,
                alignment: 'right',
                fontSize: 8,
                color: c.muted,
                margin: [0, 6, 0, 0]
              }
            ]
          },
          {
            text: 'Une solution Wokite Technologies & Innovation',
            alignment: 'center',
            fontSize: 7,
            color: c.muted,
            margin: [0, 4, 0, 0]
          }
        ]
      }),

      styles: {
        label: {
          bold: true,
          fontSize: 9,
          color: c.muted,
          fillColor: c.softBg
        },
        value: {
          fontSize: 9,
          color: c.text
        },
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: c.white,
          fillColor: c.navy
        }
      },

      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
        color: c.text
      }
    };
  }



  private buildWave(pageWidth: number, pageHeight: number): any[] {
    const c = this.pdfColors;

    return [
      {
        type: 'rect',
        x: 0,
        y: pageHeight - 24,
        w: pageWidth,
        h: 24,
        color: c.waveLight,
        lineColor: c.waveLight,
        lineWidth: 0
      },
      {
        type: 'rect',
        x: 0,
        y: pageHeight - 5,
        w: pageWidth,
        h: 5,
        color: c.blue,
        lineColor: c.blue,
        lineWidth: 0
      }
    ];
  }

  /**
   * Retour à la liste.
   */
  retourListe(): void {
    void this.router.navigate(['/admin/dossier-eleve/evaluations'])
  }
}