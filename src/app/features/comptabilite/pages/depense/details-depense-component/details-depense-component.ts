import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DetailsDepense } from '../../../../../core/models/comptabilite/details-depense';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-details-depense-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './details-depense-component.html',
  styleUrl: './details-depense-component.css',
})
export class DetailsDepenseComponent implements OnInit {

  private readonly RESOURCE_NAME = 'depense';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depenses';

  // Données
  depense?: DetailsDepense;
  title = 'Détails de la dépense';
  depenseId?: number;
  isLoading = true;

  // Modal
  showPreviewModal = false;

  // Services
  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly toastService = inject(ToastrService);
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

  goBack(): void {
    this.router.navigate([this.REDIRECT_PATH]);
  }
}