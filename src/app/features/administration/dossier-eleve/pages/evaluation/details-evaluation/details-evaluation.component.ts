import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { EtatCode } from '../../../../../../core/constants/etat-code';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { EvaluationDetailResponse, NoteEvaluationResponse } from '../../../../../../core/models/dossiereleve/evaluation/evaluation-details-response';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { TypeDocumentEvaluation } from '../../../../../../core/models/piecejointe/type-document-evaluation';
import { DocumentResponse } from '../../../../../../core/piecejointe/document-response.model';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

declare const pdfMake: any;


interface WorkflowStep {
  label: string;
  date?: string;
  author?: string;
  active?: boolean;
  lineCompleted?: boolean;
}

@Component({
  selector: 'app-details-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './details-evaluation.component.html',
  styleUrls: ['./details-evaluation.component.css']
})
export class DetailsEvaluationComponent implements OnInit, OnDestroy {

  errorMessage?: string;

  evaluationId?: number;

  evaluationUuid?: string;

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
  private readonly router = inject(Router);
  private readonly piecejointeService = inject(PieceJointeService);
  private readonly sanitizer = inject(DomSanitizer);

  modeEdition = false;
  isSavingNotes = false;

  recherche = '';

  pageCourante = 1;

  readonly taillePage = 10;

  detailsEvaluation: EvaluationDetailResponse = {};

  notes: NoteEvaluationResponse[] = [];

  private notesAvantModification: NoteEvaluationResponse[] = [];

  documents: DocumentResponse[] = [];

  workflowSteps: WorkflowStep[] = [];

  isChangingEtat = false;


  loadingDocuments = false;

  uploadingDocument = false;

  documentEnCoursUuid: string | null = null;

  documentTypeEnCours: string | null = null;

  showPopupAjoutDocument = false;
  showPopupRemplacementDocument = false;

  typeDocumentAjout = '';

  fichierDocumentAjout: File | null = null;

  documentEnCoursRemplacement: DocumentResponse | null = null;

  fichierDocumentRemplacement: File | null = null;


  showPreviewModal = false;
  isDocumentLoading = false;
  documentName: string = '';
  nomFichierDocument: string = '';
  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;

  ngOnInit(): void {

    this.loadOrganizationInfos();

    this.evaluationId = Number(this.activeRoute.snapshot.params['id']);

    if (this.evaluationId !== null && this.evaluationId !== undefined && !Number.isNaN(this.evaluationId)) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }

  private loadOrganizationInfos(): void {

    const organizationUuid = localStorage.getItem('v2_organization_uuid');

    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.loading.set(false);
      this.toastService.warning('Attention', 'Organisation non trouvée');
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
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
          this.loading.set(false);
        }
      });
  }

  private loadLogo(organization: OrganizationMiniResponse): void {
    this.logoPreview = null;

    if (!organization.logo?.available || !organization.logo.logoUuid) {
      return;
    }

    this.organizationConfigService
      .getLogoContent(organization.logo.logoUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (blob: Blob) => {
          this.logoPreview = URL.createObjectURL(blob);
        },

        error: (error) => {
          console.error('Erreur lors du chargement du logo :', error);
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

      return await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => { resolve(reader.result as string); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }
      );

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

      return await new Promise<string>(
        (resolve, reject) => {

          const reader = new FileReader();

          reader.onloadend = () => { resolve(reader.result as string); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }
      );

    } catch (error) {

      console.error(
        'Impossible de charger le logo Scoolli :',
        error
      );

      return null;
    }
  }

  getDetailsEvaluation(evalId: number): void {

    this.loading.set(true);

    this.dossierResource
      .getDetailsEvaluation(evalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: EvaluationDetailResponse) => {

          this.detailsEvaluation = data;

          this.evaluationUuid = this.detailsEvaluation.evaluationUuid;

          this.initialiserNotes(data);

          this.initialiserDocuments(data);

          this.initialiserWorkflow(data);

          this.pageCourante = (data.notes?.number ?? 0) + 1;

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error('Erreur récupération évaluation :', error);

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

  get actionEtat(): { code: string; label: string; description: string; icon: string; } | null {
    const codeEtatActuel = this.obtenirCodeEtat(this.detailsEvaluation.etat);

    switch (codeEtatActuel) {

      case EtatCode.ETAT_BROUILLON:
        return {
          code: EtatCode.ETAT_PLANIFIE,
          label: 'Planifier',
          description: 'Cette évaluation sera planifiée et pourra ensuite être marquée comme passée.',
          icon: '◷'
        };

      case EtatCode.ETAT_PLANIFIE:
        return {
          code: EtatCode.ETAT_PASSE,
          label: 'Marquer comme passée',
          description: 'Cette action indique que l’évaluation a effectivement été passée par les élèves.',
          icon: '✓'
        };

      case EtatCode.ETAT_PASSE:
        return {
          code: EtatCode.ETAT_EN_COURS_CORRECTION,
          label: 'Commencer la correction',
          description: 'La correction des copies sera officiellement démarrée.',
          icon: '✎'
        };

      case EtatCode.ETAT_EN_COURS_CORRECTION:
        return {
          code: EtatCode.ETAT_TERMINE,
          label: 'Terminer l’évaluation',
          description: 'L’évaluation sera considérée comme définitivement terminée.',
          icon: '✓'
        };

      default:
        return null;
    }
  }

  private normaliserEtat(etat?: string | null): string {
    if (!etat) {
      return '';
    }
    return etat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  private obtenirCodeEtat(etatLibelle?: string | null): string {

    const etat = this.normaliserEtat(etatLibelle);

    switch (etat) {

      case this.normaliserEtat(EtatLibelle.LIBELLE_ETAT_BROUILLON):
        return EtatCode.ETAT_BROUILLON;

      case this.normaliserEtat(EtatLibelle.LIBELLE_ETAT_PLANIFIE):
        return EtatCode.ETAT_PLANIFIE;

      case this.normaliserEtat(EtatLibelle.LIBELLE_ETAT_PASSE):
        return EtatCode.ETAT_PASSE;

      case this.normaliserEtat(EtatLibelle.LIBELLE_ETAT_EN_CORRECTION):
        return EtatCode.ETAT_EN_COURS_CORRECTION;

      case this.normaliserEtat(EtatLibelle.LIBELLE_ETAT_TERMINE):
        return EtatCode.ETAT_TERMINE;

      default:
        return '';
    }
  }

  confirmerChangementEtat(content: any): void {
    if (!this.evaluationId || !this.actionEtat) {
      return;
    }

    if (this.modeEdition) {
      this.toastService.warning('Veuillez d’abord enregistrer ou annuler les modifications des notes.');
      return;
    }

    const modalRef = this.modalService.open(
      content,
      {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'state-change-modal'
      }
    );

    modalRef.result
      .then((result) => {

        if (result === 'confirm') {
          this.changerEtatEvaluation();
        }

      })
      .catch(() => { });
  }


  private changerEtatEvaluation(): void {
    if (!this.evaluationId || !this.actionEtat) {
      return;
    }

    this.isChangingEtat = true;

    this.dossierResource.changeEtatResource('evaluation', this.evaluationId, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (response: any) => {
          this.isChangingEtat = false;

          this.toastService.success(
            response?.message ?? `L'évaluation est maintenant "${this.actionEtat?.label}".`
          );

          this.getDetailsEvaluation(this.evaluationId!);
        },

        error: (error: any) => {

          this.isChangingEtat = false;

          console.error('Erreur lors du changement d’état de l’évaluation :', error);

          this.toastService.error(
            error?.error?.message ??
            'Impossible de modifier l’état de l’évaluation.'
          );
        }
      });
  }

  private initialiserNotes(data: EvaluationDetailResponse): void {
    this.notes = data.notes?.content ?? [];
  }

  private initialiserDocuments(data: EvaluationDetailResponse): void {
    this.documents = (data.documents ?? []) as unknown as DocumentResponse[];
  }

  private initialiserWorkflow(data: EvaluationDetailResponse): void {
    const workflow = [
      {
        code: EtatCode.ETAT_BROUILLON,
        label: EtatLibelle.LIBELLE_ETAT_BROUILLON,
        date: data.dateCreation
      },
      {
        code: EtatCode.ETAT_PLANIFIE,
        label: EtatLibelle.LIBELLE_ETAT_PLANIFIE,
        date: data.datePlanification
      },
      {
        code: EtatCode.ETAT_PASSE,
        label: EtatLibelle.LIBELLE_ETAT_PASSE,
        date: data.datePassage
      },
      {
        code: EtatCode.ETAT_EN_COURS_CORRECTION,
        label: EtatLibelle.LIBELLE_ETAT_EN_CORRECTION,
        date: data.dateDebutCorrection
      },
      {
        code: EtatCode.ETAT_TERMINE,
        label: EtatLibelle.LIBELLE_ETAT_TERMINE,
        date: data.dateTerminee
      }
    ];

    const codeEtatActuel = this.obtenirCodeEtat(data.etat);

    const indexEtatActuel = workflow.findIndex(step => step.code === codeEtatActuel);

    if (indexEtatActuel === -1) {
      console.warn('État de l’évaluation non reconnu dans le workflow :', data.etat);

      this.workflowSteps = workflow.map(
        step => ({
          label: step.label,
          date: '',
          active: false,
          lineCompleted: false
        })
      );

      return;
    }

    this.workflowSteps = workflow.map((step, index): WorkflowStep => ({
      label: step.label,
      active: index <= indexEtatActuel,
      date: index <= indexEtatActuel ? this.formaterDateWorkflow(step.date) : '',
      lineCompleted: index < indexEtatActuel
    })
    );
  }

  private formaterDateWorkflow(date?: string | null): string {
    if (!date) {
      return '';
    }

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
      return '';
    }

    return valeur.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  get notesFiltrees(): NoteEvaluationResponse[] {
    const recherche = this.recherche.trim().toLowerCase();
    if (!recherche) {
      return this.notes;
    }

    return this.notes.filter(note => {
      const nom = note.nomComplet?.toLowerCase() ?? '';
      const matricule = note.matricule?.toLowerCase() ?? '';
      return (nom.includes(recherche) || matricule.includes(recherche));
    });
  }

  get nombreEleves(): number {
    return this.detailsEvaluation.nombreEleves ?? 0;
  }

  get copiesSaisies(): number {
    return this.detailsEvaluation.nombreCopiesSaisies ?? 0;
  }

  get nombreAbsents(): number {
    return this.detailsEvaluation.nombreAbsences ?? 0;
  }

  get moyenne(): number {
    return this.detailsEvaluation.moyenne ?? 0;
  }

  get noteMinimale(): number {
    return this.detailsEvaluation.noteMin ?? 0;
  }

  get noteMaximale(): number {
    return this.detailsEvaluation.noteMax ?? 0;
  }

  get pourcentageCopies(): number {
    if (!this.nombreEleves) {
      return 0;
    }
    return Math.round((this.copiesSaisies / this.nombreEleves) * 100);
  }

  get totalElevesFiltres(): number {
    return this.notesFiltrees.length;
  }

  get nombrePages(): number {
    return Math.max(1, this.detailsEvaluation.notes?.totalPages ?? 1);
  }

  get debutPagination(): number {
    return ((this.detailsEvaluation.notes?.number ?? 0) * (this.detailsEvaluation.notes?.size ?? this.taillePage));
  }

  get finPagination(): number {
    const debut = this.debutPagination;
    const nombre = this.detailsEvaluation.notes?.numberOfElements ?? this.notes.length;
    return debut + nombre;
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.nombrePages
      },
      (_, index) => index + 1
    );
  }

  rechercher(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.recherche = input.value;
  }

  effacerRecherche(): void {
    this.recherche = '';
  }

  allerPage(page: number): void {
    if (page < 1 || page > this.nombrePages || page === this.pageCourante) {
      return;
    }
    this.pageCourante = page;
  }

  pagePrecedente(): void {
    if (this.pageCourante > 1) {
      this.allerPage(this.pageCourante - 1);
    }
  }

  pageSuivante(): void {
    if (this.pageCourante < this.nombrePages) {
      this.allerPage(this.pageCourante + 1);
    }
  }

  getStatutNote(note: NoteEvaluationResponse): 'PRESENT' | 'ABSENT' {
    return note.note === null || note.note === undefined ? 'ABSENT' : 'PRESENT';
  }

  activerEdition(): void {
    this.notesAvantModification = structuredClone(this.notes);
    this.modeEdition = true;
  }

  annulerModification(): void {
    this.notes = structuredClone(this.notesAvantModification);
    this.modeEdition = false;
    this.notesAvantModification = [];
  }

  modifierNote(noteEvaluation: NoteEvaluationResponse, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valeur = input.value.trim();

    if (valeur === '') {
      noteEvaluation.note = null;
      return;
    }

    let note = Number(valeur);

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

  modifierStatut(noteEvaluation: NoteEvaluationResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;

    if (select.value === 'ABSENT') {
      noteEvaluation.note = null;
      return;
    }

    if (noteEvaluation.note === null || noteEvaluation.note === undefined) {
      noteEvaluation.note = 0;
    }
  }

  modifierObservation(noteEvaluation: NoteEvaluationResponse, event: Event): void {
    const input = event.target as HTMLInputElement;
    noteEvaluation.appreciation = input.value;
  }

  enregistrerNotes(): void {
    if (!this.evaluationId) {
      this.toastService.warning(
        'Impossible d’enregistrer les notes : évaluation introuvable.'
      );
      return;
    }

    const evaluation = this.detailsEvaluation;
    const noteMax = 20;

    const noteInvalide = this.notes.find(note =>
      note.note !== null && note.note !== undefined &&
      (
        Number.isNaN(Number(note.note)) ||
        Number(note.note) < 0 ||
        Number(note.note) > noteMax
      )
    );

    if (noteInvalide) {
      this.toastService.error(
        `La note de ${noteInvalide.nomComplet ?? 'cet élève'} doit être comprise entre 0 et ${noteMax}.`
      );
      return;
    }

    const noteEditRequestDTOList =
      this.notes.map(note => ({
        id: note.id,
        eleve: Number(note.eleve),
        nomCompletEleve: note.nomComplet ?? '',
        note: note.note !== null && note.note !== undefined ? Number(note.note) : 0,
        type: note.typeNote ?? evaluation.typeEvaluation,
        dateCreation: null,
        appreciation: note.appreciation ?? '',
        actif: 1
      }));

    const payload = {
      id: this.evaluationId,
      numeroEvaluation: evaluation.numeroEvaluation,
      titre: evaluation.titre,
      description: evaluation.description,
      dateEvaluation: evaluation.dateEvaluation,
      dateCreation: evaluation.dateCreation,
      evaluationType: evaluation.typeEvaluation,
      evaluationMode: evaluation.evaluationMode,
      heureDebut: evaluation.heureDebut,
      heureFin: evaluation.heureFin,
      noteEditRequestDTOList,
      actif: 1
    };

    this.isSavingNotes = true;

    this.dossierResource
      .updateNotesEvaluationsReource('evaluation', this.evaluationId!, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: () => {

          this.isSavingNotes = false;

          this.toastService.success(
            `Les notes de "${evaluation.titre}" ont été enregistrées avec succès.`
          );

          this.modeEdition = false;

          this.notesAvantModification = [];

          this.getDetailsEvaluation(this.evaluationId!);
        },

        error: (error: any) => {

          this.isSavingNotes = false;

          console.error('Erreur lors de la sauvegarde des notes :', error);

          this.toastService.error(
            error?.error?.message ?? 'Une erreur est survenue lors de l’enregistrement des notes.'
          );
        }
      });
  }

  modifierEvaluation(): void {
    console.log('Ouverture de la modification de l’évaluation');
  }

  ouvrirPopupAjoutDocument(): void {
    this.typeDocumentAjout = '';
    this.fichierDocumentAjout = null;
    this.showPopupAjoutDocument = true;
  }

  fermerPopupAjoutDocument(): void {
    this.showPopupAjoutDocument = false;
    this.typeDocumentAjout = '';
    this.fichierDocumentAjout = null;
  }

  ouvrirPopupRemplacementDocument(document: DocumentResponse): void {
    this.documentEnCoursRemplacement = document;
    this.fichierDocumentRemplacement = null;
    this.showPopupRemplacementDocument = true;
  }

  fermerPopupRemplacementDocument(): void {
    this.showPopupRemplacementDocument = false;
    this.documentEnCoursRemplacement = null;
    this.fichierDocumentRemplacement = null;
  }

  ajouterDocument(): void {
    if (!this.evaluationId) {
      return;
    }

    if (!this.typeDocumentAjout) {
      console.warn('Le type de document est obligatoire.');
      return;
    }

    if (!this.fichierDocumentAjout) {
      console.warn('Le fichier est obligatoire.');
      return;
    }

    this.uploadingDocument = true;

    this.piecejointeService
      .uploadPieceJointeEvaluation(
        this.evaluationId,
        this.fichierDocumentAjout,
        this.typeDocumentAjout as TypeDocumentEvaluation
      )
      .subscribe({
        next: response => {
          this.uploadingDocument = false;

          if (!response.success) {
            console.error(
              'Erreur ajout document :',
              response.message
            );
            return;
          }

          this.toastService.success('success', 'le document ' + this.typeDocumentAjout + 'a été ajouter avec succès')

          this.fermerPopupAjoutDocument();
          this.getDetailsEvaluation(this.evaluationId!);
        },

        error: error => {
          this.uploadingDocument = false;

          console.error(
            'Erreur ajout document évaluation :',
            error
          );
        }
      });
  }

  remplacerDocument(): void {
    if (!this.evaluationUuid) {
      return;
    }

    if (!this.documentEnCoursRemplacement) {
      console.warn('Aucun document sélectionné pour le remplacement.');
      return;
    }

    if (!this.fichierDocumentRemplacement) {
      console.warn('Aucun nouveau fichier sélectionné.');
      return;
    }

    const typeDocument = this.documentEnCoursRemplacement.typeDocument;

    if (!typeDocument) {
      console.warn('Le type de document est introuvable.');
      return;
    }

    this.uploadingDocument = true;

    this.piecejointeService
      .uploadPieceJointeEvaluation(
        Number(this.evaluationId),
        this.fichierDocumentRemplacement,
        typeDocument as TypeDocumentEvaluation
      )
      .subscribe({

        next: response => {
          this.uploadingDocument = false;

          if (!response.success) {
            console.error(
              'Erreur remplacement document :',
              response.message
            );
            return;
          }

          this.toastService.success('success', 'le document ' + this.typeDocumentAjout + 'a été remplacé avec succès')


          this.fermerPopupRemplacementDocument();
          this.getDetailsEvaluation(this.evaluationId!);
        },

        error: error => {
          this.uploadingDocument = false;

          console.error(
            'Erreur remplacement document :',
            error
          );
        }
      });
  }

  supprimerFichierAjout(): void {
    this.fichierDocumentAjout = null;
  }

  supprimerFichierRemplacement(): void {
    this.fichierDocumentRemplacement = null;
  }

  formatFileSize(size: number): string {
    if (!size) {
      return '0 octet';
    }
    const units = ['octets', 'Ko', 'Mo', 'Go'];
    const index = Math.floor(Math.log(size) / Math.log(1024));
    const value = size / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }

  selectionnerFichierRemplacement(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const fichiersAutorises = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!fichiersAutorises.includes(file.type)) {
      console.warn('Format de fichier non autorisé.');
      input.value = '';
      return;
    }

    const tailleMax = 5 * 1024 * 1024;

    if (file.size > tailleMax) {
      console.warn('Le fichier dépasse la taille maximale de 5 MB.');
      input.value = '';
      return;
    }

    this.fichierDocumentRemplacement = file;
  }

  selectionnerFichierAjout(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const fichiersAutorises = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!fichiersAutorises.includes(file.type)) {
      console.warn('Format de fichier non autorisé.');
      input.value = '';
      return;
    }
    const tailleMax = 5 * 1024 * 1024;
    if (file.size > tailleMax) {
      console.warn('Le fichier dépasse la taille maximale de 5 MB.');
      input.value = '';
      return;
    }

    this.fichierDocumentAjout = file;
  }


  imprimerFeuille(): void {
    window.print();
  }

  hasExistingFile(documentResponse: DocumentResponse): boolean {
    return !!(documentResponse?.available && documentResponse?.documentUuid);
  }

  openPreviewModal(documentResponse: DocumentResponse): void {
    if (!this.hasExistingFile(documentResponse)) {
      this.toastService.warning('Aucun fichier à prévisualiser');
      return;
    }
    this.documentName = documentResponse.typeDocument;
    this.nomFichierDocument = documentResponse.nomFichier;
    this.showPreviewModal = true;
    document.body.style.overflow = 'hidden';
    this.loadDocumentContent(documentResponse);
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    document.body.style.overflow = '';
    this.revokeDocumentUrl();
    this.documentPreviewUrl = null;
  }

  isImageFile(): boolean {
    const extension = this.getFileExtension();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',];
    return imageExtensions.includes(extension);
  }

  private getFileExtension(): string {
    const filename = this.nomFichierDocument;
    return filename.split('.').pop()?.toLowerCase() || '';
  }


  loadDocumentContent(documentResponse: DocumentResponse): void {
    const documentUuid = documentResponse.documentUuid
    if (!documentUuid) {
      this.toastService.warning('Aucun document associé à cette dépense');
      return;
    }
    this.isDocumentLoading = true;
    this.piecejointeService.getDocumentContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;
          this.revokeDocumentUrl();
          this.documentObjectUrl = window.URL.createObjectURL(blob);

          this.documentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentObjectUrl);
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement du document de la dépense :',
            error
          );
          this.toastService.error('Impossible de charger le document');
          this.isDocumentLoading = false;
        },
      });
  }

  private revokeDocumentUrl(): void {
    if (this.documentObjectUrl) {
      window.URL.revokeObjectURL(this.documentObjectUrl);
      this.documentObjectUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokeDocumentUrl();
    document.body.style.overflow = '';
  }

  telechargerDocument(documentResponse: DocumentResponse): void {
    const documentUuid = documentResponse.documentUuid;
    if (!documentUuid) {
      this.toastService.warning('Aucun fichier à télécharger');
      return;
    }
    this.isDocumentLoading = true;
    this.piecejointeService.getDocumentContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;
          try {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = documentResponse.typeDocument;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.toastService.success('Téléchargement démarré');

          } catch (error) {
            console.error(
              'Erreur lors du téléchargement :',
              error
            );
            this.toastService.error('Erreur lors du téléchargement du fichier');
          }
        },
        error: (error) => {
          console.error(
            'Erreur lors du téléchargement du document :',
            error
          );
          this.isDocumentLoading = false;
          this.toastService.error('Impossible de télécharger le document');
        },
      });
  }


  async imprimerUneEvaluation(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error(
        'Erreur',
        'Aucune évaluation à imprimer.'
      );

      return;
    }
    const document = await this.getDocumentEvaluation();
    pdfMake.createPdf(document).print();
  }

  async telechargerEvaluationPdf(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error('Erreur',
        'Aucune évaluation à télécharger.'
      );
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
      throw new Error(
        'Aucune évaluation à imprimer.'
      );
    }
    const notes = this.notesFiltrees ?? [];
    const etablissement = this.organizationData;
    const organizationLogoBase64 = await this.getOrganizationLogoBase64();
    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();
    const pageSize = {
      width: 595.28,
      height: 841.89
    };

    const formatDate = (value: any): string => {

      if (!value) {
        return '—';
      }

      const date =
        new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat(
        'fr-FR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      ).format(date);
    };

    const formatHeure = (
      value: string | null | undefined
    ): string => {

      if (!value) {
        return '—';
      }

      return value.substring(0, 5);
    };

    const valeur = (
      value: any
    ): string =>
      value !== null &&
        value !== undefined &&
        value !== ''
        ? String(value)
        : '—';

    const lignesNotes =
      notes.map(
        (
          detail: any,
          index: number
        ) => [

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
              text:
                detail.note !== null &&
                  detail.note !== undefined
                  ? String(detail.note)
                  : '—',
              alignment: 'center',
              bold: true
            },

            {
              text:
                valeur(detail.appreciation)
            }
          ]
      );

    const nomEtablissement =
      etablissement?.libelle ??
      'Établissement scolaire';

    const informationsEtablissement = [
      etablissement?.adresse,
      etablissement?.telephone,
      etablissement?.email
    ].filter(
      (element: any) => !!element
    );

    const bodyNotes = [

      [
        {
          text: 'N°',
          style: 'tableHeader',
          alignment: 'center'
        },
        {
          text: 'MATRICULE',
          style: 'tableHeader',
          alignment: 'center'
        },
        {
          text: 'NOM ET PRÉNOM',
          style: 'tableHeader'
        },
        {
          text: 'NOTE',
          style: 'tableHeader',
          alignment: 'center'
        },
        {
          text: 'APPRÉCIATION',
          style: 'tableHeader'
        }
      ],

      ...lignesNotes
    ];

    return {

      pageSize: 'A4',

      pageOrientation: 'portrait',

      pageMargins: [
        35,
        35,
        35,
        55
      ],

      background: () => ({
        canvas:
          this.buildWave(
            pageSize.width,
            pageSize.height
          )
      }),

      header: () => ({

        margin: [
          35,
          18,
          35,
          0
        ],

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
                text:
                  informationsEtablissement.join(
                    ' | '
                  ) || ' ',
                fontSize: 8,
                color: c.muted,
                margin: [
                  0,
                  3,
                  0,
                  0
                ]
              }
            ]
          },

          ...(logo
            ? [{
              image: logo,
              width: 48,
              height: 42,
              fit: [
                48,
                42
              ],
              alignment:
                'right' as const
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
          margin: [
            0,
            8,
            0,
            16
          ]
        },

        {
          text:
            'FICHE D’ÉVALUATION',
          fontSize: 19,
          bold: true,
          color: c.navy,
          alignment: 'center',
          margin: [
            0,
            0,
            0,
            5
          ]
        },

        {
          text:
            valeur(
              evaluation.numeroEvaluation
            ),
          fontSize: 10,
          color: c.muted,
          alignment: 'center',
          margin: [
            0,
            0,
            0,
            18
          ]
        },

        {
          table: {

            widths: [
              '30%',
              '70%'
            ],

            body: [

              [
                {
                  text: 'Titre',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation.titre
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Description',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation.description
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Matière',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation
                        .evaluationInformationsResponse
                        ?.matiereLibelle
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Classe',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation
                        .evaluationInformationsResponse
                        ?.classeLibelle
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Année scolaire',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation
                        .evaluationInformationsResponse
                        ?.anneeScolaireLibelle
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Enseignant(e)',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation
                        .evaluationInformationsResponse
                        ?.enseignantNomComplet
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Type',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation.typeEvaluation
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Mode',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation.evaluationMode
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'État',
                  style: 'label'
                },
                {
                  text:
                    valeur(
                      evaluation.etat
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text:
                    'Date de l’évaluation',
                  style: 'label'
                },
                {
                  text:
                    formatDate(
                      evaluation.dateEvaluation
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text: 'Horaire',
                  style: 'label'
                },
                {
                  text:
                    `${formatHeure(
                      evaluation.heureDebut
                    )} - ${formatHeure(
                      evaluation.heureFin
                    )}`,
                  style: 'value'
                }
              ],

              [
                {
                  text:
                    'Date de remise',
                  style: 'label'
                },
                {
                  text:
                    formatDate(
                      evaluation.datePassage
                    ),
                  style: 'value'
                }
              ],

              [
                {
                  text:
                    'Session / semestre',
                  style: 'label'
                },
                {
                  text:
                    evaluation
                      .evaluationInformationsResponse
                      ?.sessionSemestreLibelle,
                  style: 'value'
                }
              ]
            ]
          },

          layout: {

            hLineColor:
              () => c.border,

            vLineColor:
              () => c.border,

            hLineWidth:
              () => 0.6,

            vLineWidth:
              () => 0.6,

            paddingLeft:
              () => 8,

            paddingRight:
              () => 8,

            paddingTop:
              () => 6,

            paddingBottom:
              () => 6
          },

          margin: [
            0,
            0,
            0,
            20
          ]
        },

        {
          text:
            'RÉSULTATS DES ÉLÈVES',

          fontSize: 12,
          bold: true,
          color: c.navy,

          margin: [
            0,
            0,
            0,
            9
          ]
        },

        {
          text:
            `Nombre de notes retournées : ${notes.length}`,

          fontSize: 9,
          color: c.muted,

          margin: [
            0,
            0,
            0,
            8
          ]
        },

        {
          table: {

            headerRows: 1,

            widths: [
              25,
              82,
              '*',
              45,
              95
            ],

            body:
              bodyNotes
          },

          layout: {

            fillColor:
              (rowIndex: number) =>
                rowIndex === 0
                  ? c.navy
                  : rowIndex % 2 === 0
                    ? c.softBg
                    : null,

            hLineColor:
              () => c.border,

            vLineColor:
              () => c.border,

            hLineWidth:
              () => 0.5,

            vLineWidth:
              () => 0.5,

            paddingLeft:
              () => 5,

            paddingRight:
              () => 5,

            paddingTop:
              () => 7,

            paddingBottom:
              () => 7
          }
        },

        {
          text:
            'Signature de l’enseignant(e)',

          bold: true,
          fontSize: 10,
          color: c.navy,
          alignment: 'right',

          margin: [
            0,
            45,
            10,
            0
          ]
        },

        {
          text:
            valeur(
              evaluation
                .evaluationInformationsResponse
                ?.enseignantNomComplet
            ),

          fontSize: 9,
          alignment: 'right',

          margin: [
            0,
            8,
            10,
            0
          ]
        }
      ],

      footer:
        (
          currentPage: number,
          pageCount: number
        ) => ({

          margin: [
            35,
            10,
            35,
            15
          ],

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
                  text:
                    'Document généré avec Scoolli · scoolli.com',

                  fontSize: 8,
                  color: c.muted,

                  margin: [
                    0,
                    6,
                    0,
                    0
                  ]
                },

                {
                  text:
                    `Page ${currentPage} / ${pageCount}`,

                  alignment: 'right',
                  fontSize: 8,
                  color: c.muted,

                  margin: [
                    0,
                    6,
                    0,
                    0
                  ]
                }
              ]
            },

            {
              text:
                'Une solution Wokite Technologies & Innovation',

              alignment: 'center',
              fontSize: 7,
              color: c.muted,

              margin: [
                0,
                4,
                0,
                0
              ]
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

  private buildWave(
    pageWidth: number,
    pageHeight: number
  ): any[] {

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

    void this.router.navigate(
      ['/admin/dossier-eleve/evaluations']
    );
  }
}