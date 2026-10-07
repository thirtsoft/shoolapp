import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DetailsContratResponse } from '../../../../../core/models/rh/details-contrat-response.model';
import { RhResourceService } from '../../../services/rh-resource-service';


@Component({
  selector: 'app-details-contrat-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './details-contrat-component.html',
  styleUrl: './details-contrat-component.css',
})
export class DetailsContratComponent implements OnInit, OnDestroy {

  private readonly RESOURCE_NAME = 'contrat';
  private readonly REDIRECT_PATH = '/admin/rh/contrats';

  contrat?: DetailsContratResponse;

  title = 'Détails du contrat';

  contratUuid?: string;

  isLoading = true;

  showPreviewModal = false;
  isDocumentLoading = false;

  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;

  private readonly rhResourceService = inject(RhResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.contratUuid = this.route.snapshot.params['uuid'];
  }

  ngOnInit(): void {
    if (!this.contratUuid) {
      this.toastService.error('Identifiant du contrat manquant');
      this.goBack();
      return;
    }

    this.loadContratDetails();
  }

  private loadContratDetails(): void {
    this.isLoading = true;

    this.rhResourceService
      .getDetailsContrat(this.contratUuid!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: DetailsContratResponse) => {
          this.contrat = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des détails du contrat :',
            error
          );

          this.toastService.error(
            'Impossible de charger les détails du contrat'
          );

          this.isLoading = false;
          this.goBack();
        },
      });
  }

  // ============================================================
  // PERSONNEL
  // ============================================================

  getPersonnelFullName(): string {
    const personnel = this.contrat?.contratPersonnelResponse;

    if (!personnel) {
      return 'Personnel non renseigné';
    }

    const fullName = `${personnel.firstName ?? ''} ${personnel.lastName ?? ''}`.trim();

    return fullName || 'Personnel non renseigné';
  }

  getPersonnelMatricule(): string {
    return (
      this.contrat?.contratPersonnelResponse?.matricule ||
      'Non renseigné'
    );
  }

  getPersonnelEmail(): string {
    return (
      this.contrat?.contratPersonnelResponse?.email ||
      'Non renseigné'
    );
  }

  getPersonnelMobile(): string {
    return (
      this.contrat?.contratPersonnelResponse?.mobile ||
      'Non renseigné'
    );
  }

  getPersonnelCni(): string {
    return (
      this.contrat?.contratPersonnelResponse?.cni ||
      'Non renseignée'
    );
  }

  getPersonnelAddress(): string {
    return (
      this.contrat?.contratPersonnelResponse?.address ||
      'Non renseignée'
    );
  }

  isEligiblePaie(): boolean {
    return this.contrat?.contratPersonnelResponse?.eligiblePaie === true;
  }

  // ============================================================
  // CONTRAT
  // ============================================================

  getTypeContrat(): string {
    return (
      this.contrat?.typeContratLibelle ||
      this.contrat?.typeContratCode ||
      'Non renseigné'
    );
  }

/*   getModeRemuneration(): string {
    switch (this.contrat?.modeRemuneration) {
      case 'MENSUEL':
        return 'Mensuel';

      case 'HORAIRE':
        return 'Horaire';

      default:
        return this.contrat?.modeRemuneration || 'Non renseigné';
    }
  } */

  getStatutLabel(): string {
    switch (this.contrat?.statut) {
      case 'ACTIF':
        return 'Contrat actif';

      case 'SUSPENDU':
        return 'Contrat suspendu';

      case 'TERMINE':
        return 'Contrat terminé';

      default:
        return this.contrat?.statut || 'Non renseigné';
    }
  }

  isContratActif(): boolean {
    return this.contrat?.statut === 'ACTIF';
  }

  formatMontant(
    montant: number | null | undefined
  ): string {
    if (montant === null || montant === undefined) {
      return '0';
    }

    const nombre = Number(montant);

    if (isNaN(nombre)) {
      return '0';
    }

    const parties = nombre.toFixed(2).split('.');

    const partieEntiere = parties[0]
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const partieDecimale = parties[1] || '00';

    return `${partieEntiere},${partieDecimale}`;
  }

  hasExistingFile(): boolean {
    return !!(
      this.contrat?.documentResponse?.available &&
      this.contrat?.documentResponse?.documentUuid
    );
  }

  private getDocumentUuid(): string | null {
    return (
      this.contrat?.documentResponse?.documentUuid ??
      this.contrat?.pieceJointeUuid ??
      null
    );
  }

  getDocumentName(): string {
    const documentResponse: any = this.contrat?.documentResponse;
    return (
      documentResponse?.nomFichier ||
      documentResponse?.fileName ||
      documentResponse?.filename ||
      documentResponse?.name ||
      documentResponse?.libelle ||
      'Document du contrat'
    );
  }

  private getFileExtension(): string {
    const filename = this.getDocumentName();
    return (
      filename
        .split('.')
        .pop()
        ?.toLowerCase() || ''
    );
  }

  isImageFile(): boolean {
    const extension = this.getFileExtension();

    const imageExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'svg',
      'webp'
    ];

    return imageExtensions.includes(extension);
  }

  getFileIcon(filename?: string): string {
    if (!filename) {
      return '../../assets/img/defaultFile.png';
    }

    const extension = filename.split('.').pop()?.toLowerCase() || '';

    switch (extension) {

      case 'pdf':
        return '../../assets/img/filePdf.png';

      case 'doc':
      case 'docx':
        return '../../assets/img/fileWord.png';

      case 'xls':
      case 'xlsx':
        return '../../assets/img/fileExcel.png';

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return '../../assets/img/fileImage.png';

      case 'txt':
        return '../../assets/img/fileText.png';

      case 'zip':
      case 'rar':
      case '7z':
        return '../../assets/img/fileArchive.png';

      default:
        return '../../assets/img/defaultFile.png';
    }
  }

  getFileSize(): string {
    const documentResponse: any = this.contrat?.documentResponse;

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
      this.toastService.warning(
        'Aucun document associé à ce contrat'
      );
      return;
    }

    this.isDocumentLoading = true;

    this.rhResourceService.getDocumentContent(documentUuid)
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
            'Erreur lors du chargement du document du contrat :',
            error
          );
          this.isDocumentLoading = false;
          this.toastService.error('Impossible de charger le document');
        },
      });
  }

  openPreviewModal(): void {
    if (!this.hasExistingFile()) {
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
      this.toastService.warning(
        'Aucun fichier à télécharger'
      );
      return;
    }

    this.isDocumentLoading = true;

    this.rhResourceService.getDocumentContent(documentUuid)
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


  modifierContrat(): void {
    if (!this.contratUuid) {
      return;
    }
    this.router.navigate(['/admin/rh/contrat', 'edit', this.contratUuid]);
  }

  goBack(): void {
    this.router.navigate([this.REDIRECT_PATH]);
  }

  private revokeDocumentUrl(): void {
    if (this.documentObjectUrl) {
      window.URL.revokeObjectURL(
        this.documentObjectUrl
      );
      this.documentObjectUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokeDocumentUrl();
    document.body.style.overflow = '';
  }
}