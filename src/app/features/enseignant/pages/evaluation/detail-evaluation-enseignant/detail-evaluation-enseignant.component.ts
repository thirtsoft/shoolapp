import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsEvaluation } from '../../../../../core/models/dossiereleve/evaluation/details-evaluation';
import { TypeDocumentEvaluation } from '../../../../../core/models/piecejointe/type-document-evaluation';
import { TypeDocumentEvaluationResponse } from '../../../../../core/models/piecejointe/type-document-evaluation-response';
import { DocumentResponse } from '../../../../../core/piecejointe/document-response.model';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
@Component({
  selector: 'app-detail-evaluation-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './detail-evaluation-enseignant.component.html',
  styleUrls: ['./detail-evaluation-enseignant.component.css']
})
export class DetailEvaluationEnseignantComponent implements OnInit {

  errorMessage?: string;
  evaluationId?: number;
  isEdit: boolean = false;
  detailsEvaluation: DetailsEvaluation = {};
  isEditMode = false;
  title = "Détails évaluation";

  disableAddButton = false;

  sujetEvaluation: any = null;
  feuilleNotesEvaluation: any = null;

  nombreNotesSaisies = 0;
  nombreEleves = 0;

  showPreviewModal = false;
  isDocumentLoading = false;

  documentPreviewUrl: SafeResourceUrl | null = null;

  documentObjectUrl: string | null = null;
  documentSelectionne: DocumentResponse | null = null;

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pieceJointeService = inject(PieceJointeService);
  readonly typeDocumentEvaluation = TypeDocumentEvaluation;
  readonly typeDocumentEvaluationResponse = TypeDocumentEvaluationResponse;

  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);


  ngOnInit(): void {
    this.evaluationId = this.activeRoute.snapshot.params['id'];
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }

  ngOnDestroy(): void {

    this.revokeDocumentUrl();

    document.body.style.overflow = '';
  }

  getDetailsEvaluation(evaluationId: number): void {

    this.planification
      .getDetailsResource('evaluation', evaluationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (data: any) => {

          this.detailsEvaluation = data;

          this.chargerDocuments(data);
        },

        error: (error: any) => {

          console.error(
            'Erreur lors de la récupération des informations de l’évaluation :',
            error
          );

          this.toastService.error(
            'Erreur',
            'Impossible de récupérer les informations de l’évaluation.'
          );
        }
      });
  }

  openConfirmationDialog(action: 'valider'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.evaluationId!);
        }
      })
      .catch(() => { });
  }

  changerEtat(action: 'valider', evalId: number) {
    this.planification.changerEtatResource('evaluation', evalId).subscribe({
      next: (data: any) => {

        const successMessages: { [key: string]: string } = {
          valider: `Evaluation ${this.detailsEvaluation?.titre} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEvaluation(this.evaluationId!);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  getStatusClass(): string {
    const etat = this.detailsEvaluation.etat;
    if (etat === 'Validée') return 'status-validated';
    if (etat === 'Envoyée') return 'status-sent';
    if (etat === 'Remise') return 'status-remise';
    return '';
  }

  imprimerUneEvaluation(event: any) { }


  onSujetFileSelected(event: Event): void {
    this.gererSelectionFichier(event, TypeDocumentEvaluation.SUJET);
  }

  onFeuilleNotesFileSelected(event: Event): void {
    this.gererSelectionFichier(event, TypeDocumentEvaluation.FEUILLE_NOTES);
  }

  private gererSelectionFichier(event: Event, typeDocument: TypeDocumentEvaluation): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }
    const fichier = input.files[0];

    this.ajouterPieceJointeEvaluation(fichier, typeDocument);

    input.value = '';
  }


  private ajouterPieceJointeEvaluation(fichier: File, typeDocument: TypeDocumentEvaluation): void {

    if (!this.evaluationId) {
      this.toastService.error('Erreur', 'Identifiant de l’évaluation introuvable.');
      return;
    }

    this.disableAddButton = true;

    this.pieceJointeService.uploadPieceJointeEvaluation(this.evaluationId, fichier, typeDocument)
      .subscribe({

        next: (response: any) => {

          this.disableAddButton = false;

          if (response?.success) {

            const message = typeDocument === TypeDocumentEvaluation.SUJET
              ? 'Le sujet de l’évaluation a été ajouté avec succès.'
              : 'La feuille de notes a été ajoutée avec succès.';

            this.toastService.success('Succès', message);

            this.getDetailsEvaluation(this.evaluationId!);

          } else {

            this.toastService.error(
              'Erreur',
              response?.message ?? 'Impossible d’ajouter la pièce jointe.'
            );
          }
        },

        error: (error) => {

          this.disableAddButton = false;

          console.error('Erreur upload pièce jointe évaluation :', error);

          this.toastService.error(
            'Erreur',
            error?.error?.message ?? 'Impossible d’ajouter la pièce jointe.'
          );
        }
      });
  }

  private chargerDocuments(data: DetailsEvaluation): void {

    const documents = data.documentResponses ?? [];

    this.sujetEvaluation =
      documents.find(
        document =>
          document.typeDocument ===
          TypeDocumentEvaluationResponse.SUJET_EVALUATION
      ) ?? null;

    this.feuilleNotesEvaluation =
      documents.find(
        document =>
          document.typeDocument ===
          TypeDocumentEvaluationResponse.FEUILLE_NOTES
      ) ?? null;
  }

  visualiserDocument(document: any): void {

    if (!document?.available || !document.documentUuid) {
      this.toastService.warning(
        'Aucun document disponible',
        'Le document demandé est introuvable.'
      );
      return;
    }

    this.documentSelectionne = document;
    this.showPreviewModal = true;
    document.body.style.overflow = 'hidden';

    this.loadDocumentContent();
  }

  private loadDocumentContent(): void {

    const documentUuid =
      this.documentSelectionne?.documentUuid;

    if (!documentUuid) {
      this.toastService.warning(
        'Aucun document disponible'
      );
      return;
    }

    this.isDocumentLoading = true;

    this.pieceJointeService
      .getDocumentContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (blob: Blob) => {

          this.isDocumentLoading = false;

          this.revokeDocumentUrl();

          this.documentObjectUrl =
            window.URL.createObjectURL(blob);

          this.documentPreviewUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.documentObjectUrl
            );
        },

        error: (error: any) => {

          console.error(
            'Erreur lors du chargement du document :',
            error
          );

          this.isDocumentLoading = false;

          this.toastService.error(
            'Erreur',
            'Impossible de charger le document.'
          );
        }
      });
  }

  getDocumentName(): string {
    return (
      this.documentSelectionne?.nomFichier ||
      'Document de l’évaluation'
    );
  }

  getDocumentTypeLabel(): string {

    switch (this.documentSelectionne?.typeDocument) {

      case TypeDocumentEvaluationResponse.SUJET_EVALUATION:
        return 'Sujet de l’évaluation';

      case TypeDocumentEvaluationResponse.FEUILLE_NOTES:
        return 'Feuille de notes';

      default:
        return 'Document';
    }
  }



  saisirNotes() {

  }

  telechargerDocument(document: any): void {

    const documentUuid = document?.documentUuid;

    if (!documentUuid) {
      this.toastService.warning(
        'Aucun fichier à télécharger'
      );
      return;
    }

    this.isDocumentLoading = true;

    this.pieceJointeService
      .getDocumentContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: (blob: Blob) => {

          this.isDocumentLoading = false;

          try {

            const url =
              window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

            link.download =
              document.nomFichier ||
              'document-evaluation';

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            this.toastService.success(
              'Téléchargement démarré'
            );

          } catch (error) {

            console.error(
              'Erreur lors du téléchargement :',
              error
            );

            this.toastService.error(
              'Erreur',
              'Erreur lors du téléchargement du fichier.'
            );
          }
        },

        error: (error: any) => {

          console.error(
            'Erreur lors du téléchargement du document :',
            error
          );

          this.isDocumentLoading = false;

          this.toastService.error(
            'Erreur',
            'Impossible de télécharger le document.'
          );
        }
      });
  }

  closePreviewModal(): void {

    this.showPreviewModal = false;

    document.body.style.overflow = '';

    this.revokeDocumentUrl();

    this.documentPreviewUrl = null;

    this.documentSelectionne = null;
  }

  private revokeDocumentUrl(): void {

    if (this.documentObjectUrl) {

      window.URL.revokeObjectURL(
        this.documentObjectUrl
      );

      this.documentObjectUrl = null;
    }
  }

  peutModifierDocuments(): boolean {
    return true;
  }

  supprimerDocument(event: any): boolean {
    return true;
  }

  modifierEvaluation() {

  }

  peutEnvoyerEvaluation(): boolean {
    return true;
  }

  envoyerEvaluation() { }

  goBack() {
    window.history.back();
  }
}
