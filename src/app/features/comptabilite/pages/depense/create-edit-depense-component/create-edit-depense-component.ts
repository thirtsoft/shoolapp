import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FileValidator } from '../../../../../core/constants/file-validator';
import { Depense, DepenseAddEdit } from '../../../../../core/models/comptabilite/depense';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { TypeDepense } from '../../../../../core/models/referentiels/type-depense';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-create-edit-depense-component',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './create-edit-depense-component.html',
  styleUrl: './create-edit-depense-component.css',
})
export class CreateEditDepenseComponent implements OnInit {

  private readonly RESOURCE_NAME = 'depense';
  private readonly RESOURCE_UPLOAD_FILE_NAME = 'comptabilite/depense';
  private readonly REDIRECT_PATH = '/admin/comptabilite/depenses';


  errorMessage?: string;
  depenseForm: FormGroup;
  depense?: Depense;
  isEdit = false;
  title = 'Ajouter une dépense';
  currentFile: File | null = null;

  typeDepenseList: TypeDepense[] = [];
  moyenPaiementList: MoyenPaiement[] = [];
  utilisateur?: Utilisateur;

  depenseId?: number;
  userId?: number;
  ecoleId?: number;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localStorage = inject(LocalStorageService);

  constructor() {
    this.depenseId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : undefined;
    this.userId = this.localStorage.getItem('id');
    this.ecoleId = this.localStorage.getItem('ecoleId');
    this.isEdit = !!this.depenseId;
    this.title = this.isEdit ? 'Modifier une dépense' : 'Ajouter une dépense';

    this.depenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadReferentialData();

    if (this.isEdit && this.depenseId) {
      this.loadDepense(this.depenseId);
    }

    this.setupReferenceValidation();
  }

  get isFormValid(): boolean {
    if (this.depenseForm.invalid) {
      return false;
    }

    if (!this.isEdit && !this.currentFile) {
      return false;
    }

    if (this.shouldShowReference()) {
      const referenceControl = this.depenseForm.get('reference');
      if (!referenceControl || referenceControl.invalid) {
        return false;
      }
    }

    return true;
  }

  getButtonTooltip(): string {
    if (this.depenseForm.invalid) {
      const champsInvalides = this.getInvalidFields();
      return `Champs obligatoires manquants : ${champsInvalides.join(', ')}`;
    }

    if (!this.isEdit && !this.currentFile) {
      return 'Veuillez sélectionner une pièce jointe';
    }

    if (this.shouldShowReference()) {
      const referenceControl = this.depenseForm.get('reference');
      if (referenceControl?.invalid) {
        return 'La référence de transaction est obligatoire';
      }
    }

    return '';
  }

  private getInvalidFields(): string[] {
    const champs: string[] = [];
    const controls = this.depenseForm.controls;

    if (controls['designation'].invalid) champs.push('Désignation');
    if (controls['typeDepense'].invalid) champs.push('Type dépense');
    if (controls['montantDepense'].invalid) champs.push('Montant');
    if (controls['modePaiement'].invalid) champs.push('Mode paiement');

    if (this.shouldShowReference() && controls['reference'].invalid) {
      champs.push('Référence');
    }

    return champs;
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      id: [null],
      designation: ['', [Validators.required, Validators.maxLength(255)]],
      typeDepense: [null, Validators.required],
      montantDepense: [null, [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      modePaiement: [null, Validators.required],
      reference: ['']
    });
  }

  private setupReferenceValidation(): void {
    this.depenseForm.get('modePaiement')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const referenceControl = this.depenseForm.get('reference');
        if (!referenceControl) return;

        if (this.shouldShowReference()) {
          referenceControl.setValidators([Validators.required, Validators.maxLength(100)]);
        } else {
          referenceControl.clearValidators();
          referenceControl.setValue('');
        }
        referenceControl.updateValueAndValidity({ emitEvent: false });
      });
  }

  private loadReferentialData(): void {
    if (this.userId) {
      this.utilisateurService.getUtilisateur(this.userId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => this.utilisateur = data,
          error: (error) => {
            console.error('Erreur chargement utilisateur:', error);
            this.toastService.error('Erreur', 'Impossible de charger les informations utilisateur');
          }
        });
    }

    this.referentielService.getResourceList('typedepense')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => this.typeDepenseList = data,
        error: (error) => {
          console.error('Erreur chargement types dépense:', error);
          this.toastService.error('Erreur', 'Impossible de charger les types de dépense');
        }
      });

    this.referentielService.getResourceList('moyenpaiement')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => this.moyenPaiementList = data,
        error: (error) => {
          console.error('Erreur chargement moyens paiement:', error);
          this.toastService.error('Erreur', 'Impossible de charger les moyens de paiement');
        }
      });
  }

  private loadDepense(depenseId: number): void {
    this.comptabiliteResource.recupererUneResource(this.RESOURCE_NAME, depenseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.depense = data;
          this.patchFormWithDepense(data);
        },
        error: (error) => {
          console.error('Erreur chargement dépense:', error);
          this.toastService.error('Erreur', 'Impossible de charger la dépense');
          this.goBack();
        }
      });
  }

  private patchFormWithDepense(depense: DepenseAddEdit): void {
    this.depenseForm.patchValue({
      id: depense.id ?? null,
      designation: depense.designation ?? '',
      typeDepense: depense.typeDepense ?? null,
      montantDepense: depense.montantDepense ?? null,
      modePaiement: depense.modePaiement ?? null,
      reference: depense.reference ?? ''
    });
  }

  shouldShowReference(): boolean {
    const moyenId = this.depenseForm.get('modePaiement')?.value;
    if (!moyenId || this.moyenPaiementList.length === 0) return false;

    const moyen = this.moyenPaiementList.find(m => m.id === Number(moyenId));
    if (!moyen?.libelle) return false;

    const nomMoyen = moyen.libelle.toLowerCase().trim();
    return !nomMoyen.includes('espèce') && !nomMoyen.includes('espece');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) return;

    if (file.size > FileValidator.MAX_FILE_SIZE) {
      this.errorMessage = `Le fichier "${file.name}" dépasse la taille maximale de 2MB`;
      input.value = '';
      return;
    }

    if (!FileValidator.ALLOWED_FILE_TYPES.includes(file.type)) {
      this.errorMessage = `Le type de fichier "${file.type}" n'est pas autorisé`;
      input.value = '';
      return;
    }

    this.errorMessage = undefined;
    this.currentFile = file;
  }

  removeCurrentFile(): void {
    this.currentFile = null;
    this.errorMessage = undefined;
  }

  onSubmit(): void {
    // Double vérification avant soumission
    if (!this.isFormValid) {
      this.markFormGroupTouched(this.depenseForm);

      if (this.depenseForm.invalid) {
        this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      } else if (!this.isEdit && !this.currentFile) {
        this.toastService.warning('Attention', 'Veuillez sélectionner une pièce jointe');
      }
      return;
    }

    if (this.isEdit) {
      this.updateDepenseInfo();
    } else {
      this.createDepense();
    }
  }

  private createDepense(): void {
    const formData = this.buildFormData();

    this.comptabiliteResource.enregistrerExercicetWithFiles(this.RESOURCE_NAME, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'La dépense a été enregistrée avec succès');
          this.goBack();
        },
        error: (error) => {
          console.error('Erreur création dépense:', error);
          this.toastService.error('Erreur', error.error?.message || 'Erreur lors de la création de la dépense');
        }
      });
  }

  updateDepenseInfo(): void {
    if (!this.depenseId) return;

    const payload = this.buildPayload();

    this.comptabiliteResource.modifierUneRessource(this.RESOURCE_NAME, this.depenseId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (this.currentFile) {
            this.uploadFileOnly();
          } else {
            this.toastService.success('Succès', 'La dépense a été modifiée avec succès');
            if (data) {
              this.loadDepense(this.depenseId!);
            }
          }
        },
        error: (error) => {
          console.error('Erreur modification dépense:', error);
          this.toastService.error('Erreur', error.error?.message || 'Erreur lors de la modification de la dépense');
        }
      });
  }

  uploadFileOnly(): void {
    if (!this.currentFile) {
      this.toastService.warning('Attention', 'Aucun fichier sélectionné');
      return;
    }

    if (!this.depenseId) {
      this.toastService.error('Erreur', 'ID de dépense manquant');
      return;
    }

    this.pieceJointeService.uploadUnePieceJointeObjet(
      this.RESOURCE_UPLOAD_FILE_NAME,
      this.depenseId,
      this.currentFile
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success('Succès', 'La pièce jointe a été mise à jour avec succès');
          this.currentFile = null;
          this.loadDepense(this.depenseId!);
        },
        error: (error) => {
          console.error('❌ Erreur upload fichier:', error);

          let errorMessage = 'Erreur lors de l\'upload du fichier';

          if (error.status === 400) {
            errorMessage = error.error?.message || 'Fichier invalide';
          } else if (error.status === 404) {
            errorMessage = 'Dépense introuvable';
          } else if (error.status === 413) {
            errorMessage = 'Fichier trop volumineux (max 5MB)';
          } else if (error.status === 415) {
            errorMessage = 'Type de fichier non supporté';
          } else if (error.status === 500) {
            errorMessage = error.error?.message || 'Erreur serveur';
          }

          this.toastService.error('Erreur', errorMessage);
        }
      });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const payload = this.buildPayload();

    if (this.currentFile) {
      formData.append('file', this.currentFile, this.currentFile.name);
    }
    formData.append('depense', JSON.stringify(payload));

    return formData;
  }

  private buildPayload(): DepenseAddEdit {
    const formValue = this.depenseForm.value;

    return {
      id: formValue.id,
      designation: formValue.designation.trim(),
      typeDepense: formValue.typeDepense ? Number(formValue.typeDepense) : null,
      montantDepense: formValue.montantDepense ? Number(formValue.montantDepense) : null,
      modePaiement: formValue.modePaiement ? Number(formValue.modePaiement) : null,
      reference: formValue.reference?.trim() ?? '',
      createdBy: this.userId
    };
  }

  /**
   * Formate un montant avec des espaces pour les milliers
   * Exemple: 300000 -> "300 000"
   */
  formatMontant(montant: number | null): string {
    if (montant === null || montant === undefined) return '';

    const nombre = Number(montant);
    if (isNaN(nombre)) return '';

    const parties = nombre.toString().split('.');
    const partieEntiere = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const partieDecimale = parties.length > 1 ? ',' + parties[1] : '';

    return partieEntiere + partieDecimale;
  }

  /**
   * Gère la saisie du montant avec formatage en temps réel
   */
  onMontantInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valeur = input.value;

    const cursorPosition = input.selectionStart || 0;
    const espacesAvant = (valeur.substring(0, cursorPosition).match(/\s/g) || []).length;

    valeur = valeur.replace(/[^\d,]/g, '');
    valeur = valeur.replace(',', '.');

    if (valeur === '' || valeur === '.') {
      this.depenseForm.get('montantDepense')?.setValue(null, { emitEvent: false });
      this.depenseForm.get('montantDepense')?.markAsTouched();
      input.value = '';
      return;
    }

    const nombre = parseFloat(valeur);
    if (!isNaN(nombre)) {
      this.depenseForm.get('montantDepense')?.setValue(nombre, { emitEvent: false });
      this.depenseForm.get('montantDepense')?.markAsTouched();

      const valeurFormatee = this.formatMontant(nombre);
      input.value = valeurFormatee;

      setTimeout(() => {
        const espacesApres = (valeurFormatee.substring(0, cursorPosition).match(/\s/g) || []).length;
        const nouvellePosition = Math.min(
          cursorPosition + (espacesApres - espacesAvant),
          valeurFormatee.length
        );
        input.setSelectionRange(nouvellePosition, nouvellePosition);
      });
    }
  }

  /**
   * Gère la perte de focus sur le champ montant
   */
  onMontantBlur(): void {
    const control = this.depenseForm.get('montantDepense');
    if (control?.value) {
      const inputElement = document.querySelector(
        'input[type="text"][formControlName="montantDepense"]'
      ) as HTMLInputElement;

      if (inputElement) {
        inputElement.value = this.formatMontant(control.value);
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFileIcon(filename: string): string {
    if (!filename) return 'assets/img/defaultFile.png';

    const extension = filename.split('.').pop()?.toLowerCase() || '';

    const iconMap: Record<string, string> = {
      pdf: 'assets/img/filePdf.png',
      doc: 'assets/img/fileWord.png',
      docx: 'assets/img/fileWord.png',
      xls: 'assets/img/fileExcel.png',
      xlsx: 'assets/img/fileExcel.png',
      jpg: 'assets/img/fileImage.png',
      jpeg: 'assets/img/fileImage.png',
      png: 'assets/img/fileImage.png',
      gif: 'assets/img/fileImage.png',
      bmp: 'assets/img/fileImage.png',
      svg: 'assets/img/fileImage.png',
      txt: 'assets/img/fileText.png',
      zip: 'assets/img/fileArchive.png',
      rar: 'assets/img/fileArchive.png',
      '7z': 'assets/img/fileArchive.png'
    };

    return iconMap[extension] || 'assets/img/defaultFile.png';
  }

  hasExistingFile(): boolean {
    return !!this.depense?.piecesJointesDTO;
  }

  removeExistingFile(): void {
    if (!this.depense?.piecesJointesDTO?.id) return;

    this.pieceJointeService.supprimerPieceJointe(this.depense.piecesJointesDTO.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.depense) {
            this.depense.piecesJointesDTO = undefined;
          }
          this.toastService.success('Succès', 'La pièce jointe a été supprimée');
        },
        error: (error) => {
          console.error('Erreur suppression fichier:', error);
          this.toastService.error('Erreur', 'Impossible de supprimer la pièce jointe');
        }
      });
  }

  goBack(): void {
    this.router.navigate([this.REDIRECT_PATH]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.depenseForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.depenseForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      const messages: Record<string, string> = {
        designation: 'La désignation est obligatoire',
        typeDepense: 'Le type de dépense est obligatoire',
        montantDepense: 'Le montant est obligatoire',
        modePaiement: 'Le mode de paiement est obligatoire',
        reference: 'La référence est obligatoire pour ce mode de paiement'
      };
      return messages[fieldName] || 'Ce champ est obligatoire';
    }

    if (control.errors['min']) {
      return 'Le montant doit être supérieur à 0';
    }

    if (control.errors['pattern']) {
      return 'Le format du montant est invalide (ex: 45000.00)';
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    }

    return 'Champ invalide';
  }

}