import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DetailsExercice } from '../../../../../core/models/planification/details-exercice';
import { DateformatService } from '../../../../../core/services/date-format.service';
import { DossierEleveService } from '../../../../administration/dossier-eleve/service/dossier-eleve.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';

interface DocumentExercice {
  available?: boolean;
  documentUuid?: string;
  nomFichier?: string;
  typeDocument?: string;
}

@Component({
  selector: 'app-details-exercice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-exercice.component.html',
  styleUrls: ['./details-exercice.component.css']
})
export class DetailsExerciceComponent implements OnInit, OnDestroy {

  exerciceId!: number;

  detailsExercice: DetailsExercice = {};

  title = 'Détails d\'un exercice';

  isLoading = false;
  isActionLoading = false;

  errorMessage = '';

  profil: 'PARENT' | 'ENSEIGNANT' | 'ADMINISTRATION' = 'PARENT';

  showPreviewModal = false;
  isDocumentLoading = false;
  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;

  private readonly planificationResource = inject(PlanificationResourceService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dateFormat = inject(DateformatService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toastService = inject(ToastrService);
  private readonly dossierEleveService = inject(DossierEleveService);

  constructor() {
    const id = this.activeRoute.snapshot.params['id'];
    if (id) {
      this.exerciceId = Number(id);
    }
  }

  ngOnInit(): void {
    if (this.exerciceId) {
      this.getDetailsExercice(this.exerciceId);
    }
  }

  getDetailsExercice(exerciceId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.planificationResource
      .getDetailsResource('planification/exercice', exerciceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.detailsExercice = data || {};
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error(
            'Erreur lors de la récupération des détails de l’exercice :',
            error
          );

          this.isLoading = false;
          this.errorMessage =
            error?.error?.message || 'Impossible de récupérer les détails de l’exercice.';
        }
      });
  }

  isBrouillon(): boolean {
    const etat = this.detailsExercice?.libelleEtat?.trim()?.toUpperCase();
    return (
      etat === 'BROUILLON' ||
      etat === 'BROUILLONNE' ||
      etat === 'DRAFT'
    );
  }

  isPublie(): boolean {
    const etat = this.detailsExercice?.libelleEtat?.trim()?.toUpperCase();
    return (
      etat === 'PUBLIÉ' ||
      etat === 'PUBLIE' ||
      etat === 'PUBLISHED'
    );
  }

  getEtatClass(): string {
    if (this.isPublie()) {
      return 'status-published';
    }

    if (this.isBrouillon()) {
      return 'status-draft';
    }

    return 'status-default';
  }

  hasDocument(): boolean {
    return !!(
      this.detailsExercice?.documentResponse?.available &&
      this.detailsExercice?.documentResponse?.documentUuid
    );
  }

  getDocumentName(): string {
    return (
      this.detailsExercice?.documentResponse?.nomFichier ||
      'Document de l’exercice'
    );
  }

  getDocumentUuid(): string | null {
    return (
      this.detailsExercice?.documentResponse?.documentUuid ||
      null
    );
  }

  visualiserDocument(): void {
    const documentUuid = this.getDocumentUuid();
    if (!documentUuid) {
      return;
    }

    console.log(
      'Visualisation du document :',
      documentUuid
    );
  }

  telechargerDocument(): void {
    const documentUuid = this.getDocumentUuid();

    if (!documentUuid) {
      return;
    }

    console.log(
      'Téléchargement du document :',
      documentUuid
    );
  }

  formatDate(date: any | null | undefined): string {
    if (!date) {
      return '-';
    }

    try {
      return this.dateFormat.formatDate(date);
    } catch {
      return new Date(date).toLocaleDateString('fr-FR');
    }
  }

  formatDateTime(date: any | null | undefined): string {
    if (!date) {
      return '-';
    }
    try {
      const value = new Date(date);
      return value.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' à ' +
        value.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
    } catch {
      return date;
    }
  }

  getFileSize(): string {
    const documentResponse: any = this.detailsExercice?.documentResponse;
    const size =
      documentResponse?.size ??
      documentResponse?.fileSize ??
      documentResponse?.contentLength;

    if (size === null || size === undefined) {
      return 'Taille inconnue';
    }
    const sizeInBytes = Number(size);
    if (isNaN(sizeInBytes)) {
      return 'Taille inconnue';
    }
    if (sizeInBytes < 1024) {
      return `${Math.round(sizeInBytes)} o`;
    }
    if (sizeInBytes < 1048576) {
      return `${(sizeInBytes / 1024).toFixed(2)} Ko`;
    }
    return `${(sizeInBytes / 1048576).toFixed(2)} Mo`;
  }

  loadDocumentContent(): void {
    const documentUuid = this.getDocumentUuid();
    if (!documentUuid) {
      this.toastService.warning('Aucun document associé à cette dépense');
      return;
    }
    this.isDocumentLoading = true;
    this.dossierEleveService.getPhotoContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          console.log('Document dépense chargé :', blob);
          this.isDocumentLoading = false;
          this.revokeDocumentUrl();

          this.documentObjectUrl = window.URL.createObjectURL(blob);

          this.documentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.documentObjectUrl
          );
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement du document de la dépense :',
            error
          );
          this.isDocumentLoading = false;
          this.toastService.error('Impossible de charger le document');
        },
      });
  }

    private getFileExtension(): string {
    const filename = this.getDocumentName();
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  isImageFile(): boolean {
    const extension = this.getFileExtension();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',];
    return imageExtensions.includes(extension);
  }


  openPreviewModal(): void {
    if (!this.hasDocument()) {
      this.toastService.warning('Aucun fichier à prévisualiser');
      return;
    }
    this.showPreviewModal = true;
    document.body.style.overflow = 'hidden';
    this.loadDocumentContent();
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    document.body.style.overflow = '';
    this.revokeDocumentUrl();
    this.documentPreviewUrl = null;
  }

  downloadFile(): void {
    const documentUuid = this.getDocumentUuid();
    if (!documentUuid) {
      this.toastService.warning('Aucun fichier à télécharger');
      return;
    }
    this.isDocumentLoading = true;
    this.dossierEleveService.getPhotoContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;
          try {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.getDocumentName();
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

  goBack(): void {
    void this.router.navigate(['/parent/exercices']);
  }
}