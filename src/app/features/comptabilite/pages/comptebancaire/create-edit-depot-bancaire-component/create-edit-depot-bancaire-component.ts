
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { FileValidator } from '../../../../../core/constants/file-validator';
import { MontantFormatDirective } from '../../../../../core/directives/montant-format.directive';
import { CompteBancaireProjection } from '../../../../../core/models/comptabilite/tresorerie/compte-bancaire-projection-model';
import { DepotBancaireResponse } from '../../../../../core/models/comptabilite/tresorerie/depot-bancaire-response-model';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-create-edit-depot-bancaire-component',
  standalone: true,
  imports: [ReactiveFormsModule, MontantFormatDirective],
  templateUrl: './create-edit-depot-bancaire-component.html',
  styleUrl: './create-edit-depot-bancaire-component.css',
})
export class CreateEditDepotBancaireComponent implements OnInit {

  private readonly RESOURCE_NAME = 'depots-bancaires';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depots-bancaires';

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly comptaResource = inject(ComptabiliteResourceService);
  private readonly toastService = inject(ToastrService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);

  successMessage = signal<string>('');

  readonly errorMessage = signal('');

  readonly comptes = signal<CompteBancaireProjection[]>([]);

  depotBancaire?: DepotBancaireResponse;

  readonly depotId = signal<number | null>(null);

  readonly selectedFile = signal<File | null>(null);

  readonly existingPieceJointe = signal(false);

  readonly form = this.fb.nonNullable.group({
    dateDepot: ['', Validators.required],
    compteBancaireId: [0, [Validators.required, Validators.min(1)]],
    montant: [0, [Validators.required, Validators.min(0.01)]],
    reference: ['', Validators.maxLength(100)],
    observation: ['', Validators.maxLength(500)]
  });

  readonly maxFileSizeLabel = `${(
    FileValidator.MAX_FILE_SIZE / (1024 * 1024)
  ).toFixed(0)} Mo`;

  get isEditMode(): boolean {
    return this.depotId() !== null;
  }

  ngOnInit(): void {
    this.chargerComptes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const depotId = Number(id);
      if (!Number.isNaN(depotId)) {
        this.depotId.set(depotId);
        this.chargerDepot(depotId);
      }
    }
  }

  chargerComptes(): void {
    this.loading.set(true);
    this.comptaResource.getResourceList('comptes-bancaires')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.comptes.set(
            (response as CompteBancaireProjection[]) ?? []
          );

          this.loading.set(false);
        },

        error: error => {
          console.error(
            'Erreur chargement comptes bancaires :',
            error
          );

          this.loading.set(false);

          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Impossible de charger les comptes bancaires.'
          );
        }
      });
  }

  chargerDepot(id: number): void {
    this.loading.set(true);

    this.comptaResource
      .recupererUneResource(this.RESOURCE_NAME, id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.depotBancaire = response;

          this.form.patchValue({
            dateDepot: this.formatDateTimeLocal(response.dateDepot),
            compteBancaireId: response.compteBancaireId,
            montant: response.montant,
            reference: response.reference ?? '',
            observation: response.observation ?? ''
          });

          this.existingPieceJointe.set(
            response.documentResponse?.available === true &&
            !!response.documentResponse?.documentUuid
          );

          this.selectedFile.set(null);
          this.successMessage.set('');
          this.errorMessage.set('');
          this.loading.set(false);
        },
        error: error => {
          console.error('Erreur récupération dépôt bancaire :', error);
          this.loading.set(false);

          this.toastService.error(
            'Erreur',
            error?.error?.message ?? 'Impossible de charger le dépôt bancaire.'
          );

          this.retourListe();
        }
      });
  }


  onFileSelected(event: Event): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    if (file.size > FileValidator.MAX_FILE_SIZE) {
      this.rejeterFichier(
        input,
        `Le fichier "${file.name}" dépasse la taille maximale autorisée de ${this.maxFileSizeLabel}. Veuillez choisir un fichier moins volumineux.`
      );
      return;
    }

    if (!FileValidator.ALLOWED_FILE_TYPES.includes(file.type)) {
      this.rejeterFichier(
        input,
        `Le format du fichier "${file.name}" n'est pas autorisé. Formats acceptés : PDF, JPG, JPEG et PNG.`
      );
      return;
    }

    this.errorMessage.set('');
    this.selectedFile.set(file);
  }

  private rejeterFichier(input: HTMLInputElement, message: string): void {
    input.value = '';

    this.selectedFile.set(null);

    this.errorMessage.set(message);

    this.toastService.error(
      'Fichier invalide',
      message,
      {
        timeOut: 6000
      }
    );
  }

  supprimerFichierSelectionne(): void {
    this.selectedFile.set(null);
  }

  enregistrer(): void {

    this.errorMessage.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!this.isEditMode) {
      if (!this.selectedFile()) {
        this.toastService.warning('Attention', 'Veuillez sélectionner la pièce justificative du dépôt.');
        return;
      }

      this.creerDepot();

      return;
    }
    this.modifierDepot();
  }

  private creerDepot(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.saving.set(true);

    const depot = this.buildPayload();

    const formData = new FormData();

    formData.append(
      'file',
      file,
      file.name
    );

    formData.append(
      'depot',
      new Blob(
        [JSON.stringify(depot)],
        {
          type: 'application/json'
        }
      )
    );

    this.comptaResource
      .enregistrerResourcetWithFiles(
        this.RESOURCE_NAME,
        formData
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: response => {

          this.saving.set(false);

          this.toastService.success(
            'Succès',
            response?.message ?? 'Le dépôt bancaire a été enregistré avec succès.');

          this.retourListe();
        },

        error: error => {

          this.saving.set(false);

          console.error(
            'Erreur création dépôt bancaire :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Erreur lors de la création du dépôt bancaire.'
          );
        }
      });
  }

  private modifierDepot(): void {
    const id = this.depotId();
    if (id === null) {
      return;
    }

    this.saving.set(true);

    const payload = this.buildPayload();

    this.comptaResource
      .modifierUneRessource(
        this.RESOURCE_NAME,
        id,
        payload
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          const file = this.selectedFile();

          if (!file) {

            this.saving.set(false);

            this.toastService.success(
              'Succès', 'Le dépôt bancaire a été modifié avec succès.'
            );

            this.retourListe();

            return;
          }
          this.remplacerPieceJointe(file);
        },

        error: error => {

          this.saving.set(false);

          console.error(
            'Erreur modification dépôt bancaire :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Erreur lors de la modification du dépôt bancaire.'
          );
        }
      });
  }

  private remplacerPieceJointe(file: File): void {
    const id = this.depotId();
    if (id === null) {
      this.saving.set(false);
      this.toastService.error(
        'Erreur',
        'Identifiant du dépôt bancaire introuvable.'
      );
      return;
    }
    if (this.uploading()) {
      return;
    }

    this.uploading.set(true);

    this.comptaResource.modifierPieceJointeRessource(this.RESOURCE_NAME, id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.saving.set(false);
          this.selectedFile.set(null);

          this.successMessage.set('Le dépôt bancaire et sa pièce justificative ont été modifiés avec succès.');

          this.toastService.success('Succès', this.successMessage());

          this.retourListe();
        },
        error: error => {
          this.uploading.set(false);
          this.saving.set(false);

          console.error('Erreur remplacement pièce jointe :', error);

          let message = 'Le dépôt a été modifié, mais le remplacement de la pièce justificative a échoué.';

          if (error?.status === 400) {
            message = error?.error?.message ?? 'Fichier invalide.';
          } else if (error?.status === 404) {
            message = 'Dépôt bancaire introuvable.';
          } else if (error?.status === 413) {
            message = 'Fichier trop volumineux (max 2MB).';
          } else if (error?.status === 415) {
            message = 'Type de fichier non supporté.';
          }

          this.errorMessage.set(message);
          this.toastService.error('Erreur', message);
        }
      });
  }

  private buildPayload() {
    const value = this.form.getRawValue();
    return {
      dateDepot: value.dateDepot,
      compteBancaireId: Number(value.compteBancaireId),
      montant: Number(value.montant),
      reference: value.reference?.trim() || null,
      observation: value.observation?.trim() || null
    };
  }

  hasExistingFile(): boolean {
    return !!(
      this.depotBancaire?.documentResponse?.available &&
      this.depotBancaire?.documentResponse?.documentUuid
    );
  }

  getExistingFileName(): string {
    return this.depotBancaire?.documentResponse?.nomFichier
      ?? 'Pièce justificative';
  }

  get selectedFileName(): string {
    return this.selectedFile()?.name ?? '';
  }

  get selectedFileSize(): string {
    const file = this.selectedFile();
    if (!file) {
      return '';
    }
    const sizeMb = file.size / (1024 * 1024);
    return `${sizeMb.toFixed(2)} Mo`;
  }

  private formatDateTimeLocal(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.substring(0, 16);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  retourListe(): void {
    void this.router.navigate([this.REDIRECT_PATH]);
  }

  annuler(): void {
    this.retourListe();
  }


}