import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DetailsDepotBancaireResponse } from '../../../../../core/models/comptabilite/tresorerie/details-depot-bancaire-response-model';
import { DossierEleveService } from '../../../../administration/dossier-eleve/service/dossier-eleve.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

type ActionDepot = 'SOUMETTRE' | 'VALIDER';

@Component({
  selector: 'app-details-depot-bancaire-component',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TitleCasePipe],
  templateUrl: './details-depot-bancaire-component.html',
  styleUrl: './details-depot-bancaire-component.css',
})
export class DetailsDepotBancaireComponent implements OnInit, OnDestroy {


  private readonly RESOURCE_NAME = 'depots-bancaires';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depots-bancaires';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly comptaResource = inject(ComptabiliteResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly modalService = inject(NgbModal);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly saving = signal(false);

  modalAction: ActionDepot | null = null;
  modalActionLabel = '';

  detailsDepotBancaire?: DetailsDepotBancaireResponse;

  readonly depotId = signal<number | null>(null);

  @ViewChild('actionDepotModal')
  actionDepotModal!: TemplateRef<any>;

  showPreviewModal = false;
  isDocumentLoading = false;

  documentPreviewUrl: SafeResourceUrl | null = null;

  private documentObjectUrl: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.toastService.error('Erreur', 'Identifiant du dépôt bancaire introuvable.');
      this.retourListe();
      return;
    }

    const depotId = Number(id);

    if (!Number.isInteger(depotId) || depotId <= 0) {
      this.toastService.error('Erreur', 'Identifiant du dépôt bancaire invalide.');
      this.retourListe();
      return;
    }

    this.depotId.set(depotId);
    this.chargerDetailsDepotBancaire(depotId);
  }

  chargerDetailsDepotBancaire(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comptaResource
      .afficherDetailsResource(this.RESOURCE_NAME, id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.detailsDepotBancaire = response;
          this.loading.set(false);
        },
        error: error => {
          console.error('Erreur récupération dépôt bancaire :', error);

          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'Impossible de charger les détails du dépôt bancaire.'
          );

          this.toastService.error(
            'Erreur',
            this.errorMessage()
          );
        }
      });
  }

  private getEtatNormalise(): string {
    const etat = (this.detailsDepotBancaire?.etatLibelle ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

    if (etat === 'BROUILLON') return 'BROUILLON';
    if (etat === 'ENVOYE' || etat === 'ENVOYEE') return 'ENVOYEE';
    if (etat === 'VALIDE' || etat === 'VALIDEE') return 'VALIDEE';

    return etat;
  }

  isEtat(etat: string): boolean {
    return this.getEtatNormalise() === etat;
  }

  isEtatAtLeast(etat: string): boolean {
    const ordre: Record<string, number> = {
      BROUILLON: 1,
      ENVOYEE: 2,
      VALIDEE: 3
    };

    const currentOrdre = ordre[this.getEtatNormalise()];
    const targetOrdre = ordre[etat];

    return currentOrdre !== undefined &&
      targetOrdre !== undefined &&
      currentOrdre >= targetOrdre;
  }

  getEtatClass(): string {
    if (this.isEtat('BROUILLON')) return 'status-draft';
    if (this.isEtat('ENVOYEE')) return 'status-pending';
    if (this.isEtat('VALIDEE')) return 'status-validated';

    return 'status-unknown';
  }

  formatMontant(montant: number | null | undefined): string {
    if (montant === null || montant === undefined) {
      return '0';
    }

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(montant)).replace(/[\u00A0\u202F]/g, ' ');
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const parts = value.substring(0, 10).split('-');

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  formatDateTime(value: string): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  ouvrirConfirmationSoumission(): void {
    this.ouvrirConfirmation('SOUMETTRE');
  }

  ouvrirConfirmationValidation(): void {
    this.ouvrirConfirmation('VALIDER');
  }

  private ouvrirConfirmation(action: ActionDepot): void {
    this.modalAction = action;
    this.modalActionLabel = action === 'SOUMETTRE'
      ? 'soumettre'
      : 'valider';

    this.modalService.open(this.actionDepotModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.confirmerActionDepot(action);
        }
      },
      () => {
      }
    );
  }

  private confirmerActionDepot(action: ActionDepot): void {
    const id = this.depotId();

    if (!id || this.saving()) {
      return;
    }

    this.saving.set(true);

    const actionApi = action === 'SOUMETTRE' ? 'soumettre' : 'valider';

    this.comptaResource
      .executerActionResource(this.RESOURCE_NAME, id, actionApi)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.saving.set(false);

          const message = response?.trim() ||
            (action === 'SOUMETTRE'
              ? 'Le dépôt bancaire a été soumis avec succès.'
              : 'Le dépôt bancaire a été validé avec succès.');

          this.toastService.success(message, 'Succès');

          this.chargerDetailsDepotBancaire(id);
        },
        error: (error) => {
          this.saving.set(false);

          console.error(`Erreur action ${action} :`, error);

          this.toastService.error(
            error?.error?.message ??
            error?.error ??
            `Une erreur est survenue lors de ${action === 'SOUMETTRE' ? 'la soumission' : 'la validation'
            } du dépôt bancaire.`,
            'Erreur'
          );
        }
      });
  }

  hasExistingFile(): boolean {
    return !!(
      this.detailsDepotBancaire?.documentResponse?.available &&
      this.detailsDepotBancaire?.documentResponse?.documentUuid
    );
  }

  private getDocumentUuid(): string | null {
    return this.detailsDepotBancaire?.documentResponse?.documentUuid ?? null;
  }

  getDocumentName(): string {
    return this.detailsDepotBancaire?.documentResponse?.nomFichier || 'Document du dépôt bancaire';
  }

  isImageFile(): boolean {
    const extension = this.getDocumentName().split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
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

  loadDocumentContent(): void {
    const documentUuid = this.getDocumentUuid();

    if (!documentUuid) {
      this.toastService.warning('Aucun document associé à ce dépôt bancaire.');
      return;
    }

    this.isDocumentLoading = true;

    this.dossierEleveService.getPhotoContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;
          this.revokeDocumentUrl();

          this.documentObjectUrl = window.URL.createObjectURL(blob);

          this.documentPreviewUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.documentObjectUrl
            );
        },
        error: (error) => {
          console.error('Erreur chargement pièce jointe :', error);
          this.isDocumentLoading = false;
          this.toastService.error('Impossible de charger le document.');
        }
      });
  }

  openPreviewModal(): void {
    if (!this.hasExistingFile()) {
      this.toastService.warning('Aucun fichier à visualiser.');
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
      this.toastService.warning('Aucun fichier à télécharger.');
      return;
    }

    this.isDocumentLoading = true;

    this.dossierEleveService.getPhotoContent(documentUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.isDocumentLoading = false;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = this.getDocumentName();

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          this.toastService.success('Téléchargement démarré.');
        },
        error: (error) => {
          console.error('Erreur téléchargement pièce jointe :', error);
          this.isDocumentLoading = false;
          this.toastService.error('Impossible de télécharger le document.');
        }
      });
  }

  getFileExtension(): string {
    const filename = this.getDocumentName();

    const extension = filename.split('.').pop()?.toLowerCase() || '';

    return extension ? extension.toUpperCase() : 'Inconnu';
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

  retourListe(): void {
    void this.router.navigate([this.REDIRECT_PATH]);
  }

  annuler(): void {
    this.retourListe();
  }
}
