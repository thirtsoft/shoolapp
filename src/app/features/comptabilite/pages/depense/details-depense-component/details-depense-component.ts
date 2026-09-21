import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DetailsDepense } from '../../../../../core/models/comptabilite/details-depense';
import { DossierEleveService } from '../../../../administration/dossier-eleve/service/dossier-eleve.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-details-depense-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './details-depense-component.html',
  styleUrl: './details-depense-component.css',
})
export class DetailsDepenseComponent implements OnInit, OnDestroy {

  private readonly RESOURCE_NAME = 'depense';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depenses';

  depense?: DetailsDepense;
  title = 'Détails de la dépense';
  depenseId?: number;
  isLoading = true;

  showPreviewModal = false;
  isDocumentLoading = false;
  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.depenseId = this.route.snapshot.params['id']
      ? Number(this.route.snapshot.params['id'])
      : undefined;
  }

  ngOnInit(): void {
    if (!this.depenseId) {
      this.toastService.error('ID de dépense manquant');
      this.goBack();
      return;
    }
    this.loadDepenseDetails();
  }

  private loadDepenseDetails(): void {
    this.isLoading = true;
    this.comptabiliteResource.afficherDetailsResource(this.RESOURCE_NAME, this.depenseId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.depense = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des détails de la dépense :',
            error
          );
          this.toastService.error('Impossible de charger les détails de la dépense');
          this.isLoading = false;
          this.goBack();
        },
      });
  }

  formatMontant(montant: number | null | undefined): string {
    if (montant === null || montant === undefined) {
      return '0';
    }
    const nombre = Number(montant);
    if (isNaN(nombre)) {
      return '0';
    }
    const parties = nombre.toFixed(2).split('.');
    const partieEntiere = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const partieDecimale = parties[1] || '00';
    return `${partieEntiere},${partieDecimale}`;
  }

  hasExistingFile(): boolean {
    return !!(
      this.depense?.documentResponse?.available &&
      this.depense?.documentResponse?.photoUuid
    );
  }

  private getDocumentUuid(): string | null {
    return this.depense?.documentResponse?.photoUuid ?? null;
  }

  getDocumentName(): string {
    const documentResponse: any = this.depense?.documentResponse;
    return (
      documentResponse?.nomFichier ||
      documentResponse?.fileName ||
      documentResponse?.filename ||
      documentResponse?.name ||
      documentResponse?.libelle ||
      'Document de la dépense'
    );
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
    const documentResponse: any = this.depense?.documentResponse;
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
    this.router.navigate([this.REDIRECT_PATH,]);
  }


  /*

  private readonly RESOURCE_NAME = 'depense';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depenses';

  depense?: DetailsDepense;
  title = 'Détails de la dépense';
  depenseId?: number;
  isLoading = true;

  showPreviewModal = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.depenseId = this.route.snapshot.params['id']
      ? Number(this.route.snapshot.params['id'])
      : undefined;
  }

  ngOnInit(): void {
    if (!this.depenseId) {
      this.toastService.error('ID de dépense manquant');
      this.goBack();
      return;
    }

    this.loadDepenseDetails();
  }

  private loadDepenseDetails(): void {
    this.isLoading = true;

    this.comptabiliteResource.afficherDetailsResource(this.RESOURCE_NAME, this.depenseId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.depense = data;
          this.isLoading = false;
          this.loadDocumentDepense(data);
        },
        error: (error) => {
          console.error('Erreur lors du chargement:', error);
          this.toastService.error('Impossible de charger les détails de la dépense');
          this.isLoading = false;
          this.goBack();
        }
      });
  }

  formatMontant(montant: number | null | undefined): string {
    if (montant === null || montant === undefined) return '0';

    const nombre = Number(montant);
    if (isNaN(nombre)) return '0';

    const parties = nombre.toFixed(2).split('.');
    const partieEntiere = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const partieDecimale = parties[1] || '00';

    return `${partieEntiere},${partieDecimale}`;
  }

  getFileIcon(filename: string): string {
    if (!filename) return '../../assets/img/defaultFile.png';

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

  isImageFile(): boolean {
    if (!this.depense?.piecesJointesDTO?.nomTechnique) return false;

    const extension = this.depense.piecesJointesDTO.nomTechnique.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];

    return imageExtensions.includes(extension);
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    const mimeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed'
    };

    return mimeMap[extension] || 'application/octet-stream';
  }

  getFileSize(base64Content?: string): string {
    if (!base64Content) return 'Taille inconnue';

    try {
      const base64String = base64Content.replace(/=/g, '');
      const sizeInBytes = (base64String.length * 3) / 4;

      if (sizeInBytes < 1024) {
        return `${Math.round(sizeInBytes)} o`;
      } else if (sizeInBytes < 1048576) {
        return `${(sizeInBytes / 1024).toFixed(2)} Ko`;
      } else {
        return `${(sizeInBytes / 1048576).toFixed(2)} Mo`;
      }
    } catch (error) {
      return 'Taille inconnue';
    }
  }

  hasExistingFile(): boolean {
    return !!(this.depense?.piecesJointesDTO?.nomTechnique && this.depense?.piecesJointesDTO?.content);
  }

  getPreviewUrl(): string {
    if (!this.depense?.piecesJointesDTO?.content) {
      return '';
    }

    const mimeType = this.getMimeType(this.depense.piecesJointesDTO.nomTechnique || '');
    const base64Data = this.depense.piecesJointesDTO.content;

    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return window.URL.createObjectURL(blob);
    } catch (error) {
      return `data:${mimeType};base64,${base64Data}`;
    }
  }

  openPreviewModal(): void {
    if (!this.hasExistingFile()) {
      this.toastService.warning('Aucun fichier à prévisualiser');
      return;
    }
    this.showPreviewModal = true;
    document.body.style.overflow = 'hidden';
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    document.body.style.overflow = '';
  }

  downloadFile(): void {
    if (!this.depense?.piecesJointesDTO?.content) {
      this.toastService.warning('Aucun fichier à télécharger');
      return;
    }

    try {
      const mimeType = this.getMimeType(this.depense.piecesJointesDTO.nomTechnique || '');
      const base64Data = this.depense.piecesJointesDTO.content;

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = this.depense.piecesJointesDTO.nomFichier || 'piece-jointe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      this.toastService.success('Téléchargement démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      this.toastService.error('Erreur lors du téléchargement du fichier');
    }
  }

  private loadDocumentDepense(depense: DetailsDepense): void {

    if (depense.documentResponse?.available && depense.documentResponse.photoUuid) {

      this.dossierEleveService.getPhotoContentV2(depense.documentResponse.photoUuid)
        .subscribe({

          next: (blob: any) => {

            console.log('blob response', blob);
          },

          error: (error: any) => {
            console.error('Erreur lors du chargement de la photo :', error);
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate([this.REDIRECT_PATH]);
  }
    */
}