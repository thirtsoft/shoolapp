import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../../../core/datamodel/api-response.model';
import { GetEleveResponse } from '../../../../../../core/models/dossiereleve/eleve/get-eleve-response.model';
import { UpdateElevePhotoResponse } from '../../../../../../core/models/dossiereleve/eleve/update-eleve-photo-response.model';
import { UpdateEleveRequest } from '../../../../../../core/models/dossiereleve/eleve/update-eleve-request.model';
import { DossierEleveService } from '../../../service/dossier-eleve.service';

@Component({
  selector: 'app-modification-eleve-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modification-eleve-component.html',
  styleUrl: './modification-eleve-component.css',
})
export class ModificationEleveComponent implements OnInit {

  eleveFormGroup!: FormGroup;

  eleve?: GetEleveResponse;

  eleveUuid!: string;

  currentFile?: File;

  preview = '';

  message = '';

  photoChanged = false;

  photoUploading = false;

  saving = false;

  title = "Modification d'un élève";

  typeSexe: string[] = ['Masculin', 'Féminin'];

  today = new Date();

  errorMessage?: string;

  infoEditing = false;
  photoEditing = false;

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly toastService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.initializeForm();

    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (!uuid) {
      this.toastService.error('Erreur', "L'identifiant de l'élève est manquant.");
      this.goBack();
      return;
    }
    this.eleveUuid = uuid;
    this.getEleve();
  }


  private initializeForm(): void {
    this.eleveFormGroup = this.formBuilder.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      sexe: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      address: [''],
      dateNaissance: ['', Validators.required],
      nationalite: [''],
      allergies: ['']
    });
  }

  private getEleve(): void {
    this.dossierEleveService.getEleveByUuid(this.eleveUuid)
      .subscribe({
        next: (response: ApiResponse<GetEleveResponse>) => {

          if (!response.success || !response.data) {

            this.toastService.error(
              'Erreur',
              response.message || "Impossible de récupérer les informations de l'élève."
            );
            return;
          }
          this.eleve = response.data;
          this.patchEleveForm(response.data);
          this.loadPhoto(response.data);
        },

        error: error => {
          console.error("Erreur lors du chargement de l'élève :", error);

          this.toastService.error(
            'Erreur',
            error?.error?.message || "Impossible de récupérer les informations de l'élève."
          );
        }
      });
  }


  private patchEleveForm(eleve: GetEleveResponse): void {
    this.eleveFormGroup.patchValue({
      prenom: eleve.prenom ?? '',
      nom: eleve.nom ?? '',
      sexe: eleve.sexe ?? '',
      lieuNaissance: eleve.lieuNaissance ?? '',
      address: eleve.address ?? '',
      nationalite: eleve.nationalite ?? '',
      dateNaissance: eleve.dateNaissance
        ? eleve.dateNaissance.substring(0, 10)
        : '',
      allergies: (eleve.allergies ?? []).join(', ')
    });
  }

  modifierModeInformations(): void {
    this.infoEditing = true;
  }

  modifierModePhoto(): void {
    this.photoEditing = true;
  }

  annulerModificationInformations(): void {
    if (this.eleve) {
      this.patchEleveForm(this.eleve);
    }
    this.infoEditing = false;
  }

  annulerModificationPhoto(): void {

    this.photoEditing = false;
    this.currentFile = undefined;
    this.photoChanged = false;
    this.message = '';

    if (this.eleve) {
      this.loadPhoto(this.eleve);
    }
  }

  private loadPhoto(eleve: GetEleveResponse): void {
    this.preview = '';
    this.currentFile = undefined;
    this.photoChanged = false;

    if (eleve.photo?.available && eleve.photo.photoUuid) {

      this.dossierEleveService.getPhotoContent(eleve.photo.photoUuid)
        .subscribe({

          next: (blob: Blob) => {
            this.preview = URL.createObjectURL(blob);
          },

          error: error => {
            console.error('Erreur lors du chargement de la photo :', error);
            this.preview = '';
          }
        });
    }
  }

  selectFile(event: Event): void {
    this.message = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.message = 'Seules les images sont autorisées.';
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.message = "L'image ne doit pas dépasser 2 MB.";
      input.value = '';
      return;
    }

    this.currentFile = file;
    this.photoChanged = true;
    this.photoEditing = true;

    const reader = new FileReader();

    reader.onload = () => {
      this.preview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  deletePhoto(): void {

    const confirmDelete = confirm('Voulez-vous vraiment supprimer cette photo sélectionnée ?');

    if (!confirmDelete) {
      return;
    }

    this.preview = '';
    this.currentFile = undefined;
    this.photoChanged = false;
    this.message = '';

    const fileInput = document.querySelector('#fileInput') as HTMLInputElement;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  editerUnEleve(): void {

    if (this.saving || this.photoUploading) {
      return;
    }

    const informationsModifiees = this.infoEditing;

    const photoModifiee = this.photoEditing && this.photoChanged && !!this.currentFile;

    if (!informationsModifiees && !photoModifiee) {
      this.toastService.info('Information', 'Aucune modification à enregistrer.');
      return;
    }

    if (informationsModifiees && !this.eleveFormGroup.valid) {
      this.eleveFormGroup.markAllAsTouched();
      return;
    }

    this.saving = true;

    if (informationsModifiees && photoModifiee) {
      this.modifierInformationsEtPhoto();
      return;
    }

    if (informationsModifiees) {
      this.modifierInformations();
      return;
    }

    if (photoModifiee) {
      this.modifierPhoto();
      return;
    }
  }

  private modifierInformations(): void {

    const request = this.buildUpdateEleveRequest();

    this.dossierEleveService.modifierEleve(this.eleveUuid, request)
      .subscribe({

        next: response => {

          this.saving = false;

          if (!response.success) {

            this.toastService.error(
              'Erreur',
              response.message || "Impossible de modifier les informations de l'élève."
            );
            return;
          }

          this.infoEditing = false;

          this.toastService.success(
            'Succès',
            response.message || "Les informations de l'élève ont été mises à jour."
          );
          this.goBack();
        },

        error: error => {
          this.saving = false;

          console.error('Erreur modification élève :', error);

          this.toastService.error(
            'Erreur',
            error?.error?.message || "Erreur lors de la modification des informations de l'élève."
          );
        }
      });
  }

  private modifierPhoto(): void {

    if (!this.currentFile) {
      this.saving = false;
      return;
    }

    this.photoUploading = true;

    this.dossierEleveService.modifierPhotoEleve(this.eleveUuid, this.currentFile)
      .subscribe({
        next: (response: ApiResponse<UpdateElevePhotoResponse>) => {

          this.photoUploading = false;
          this.saving = false;

          if (!response.success) {

            this.toastService.error(
              'Erreur',
              response.message || "La photo n'a pas pu être mise à jour."
            );
            return;
          }

          this.photoEditing = false;
          this.photoChanged = false;

          this.toastService.success(
            'Succès',
            response.message || "La photo de l'élève a été mise à jour."
          );
          this.goBack();
        },

        error: error => {
          this.photoUploading = false;
          this.saving = false;

          console.error('Erreur modification photo :', error);

          this.toastService.error('Erreur', "La photo n'a pas pu être mise à jour.");
        }
      });
  }

  private modifierInformationsEtPhoto(): void {

    const request = this.buildUpdateEleveRequest();

    this.dossierEleveService.modifierEleve(this.eleveUuid, request)
      .subscribe({

        next: infoResponse => {

          if (!infoResponse.success) {
            this.saving = false;

            this.toastService.error(
              'Erreur',
              infoResponse.message || "Impossible de modifier les informations de l'élève."
            );
            return;
          }
          this.modifierPhotoApresInformations();
        },

        error: error => {
          this.saving = false;
          console.error('Erreur modification informations :', error);
          this.toastService.error('Erreur', "Impossible de modifier les informations de l'élève.");
        }
      });
  }

  private modifierPhotoApresInformations(): void {
    if (!this.currentFile) {
      this.saving = false;
      this.goBack();
      return;
    }
    this.photoUploading = true;

    this.dossierEleveService.modifierPhotoEleve(this.eleveUuid, this.currentFile)
      .subscribe({

        next: (photoResponse: ApiResponse<UpdateElevePhotoResponse>) => {

          this.photoUploading = false;
          this.saving = false;

          if (!photoResponse.success) {
            this.toastService.warning('Attention', "Les informations ont été modifiées, mais la photo n'a pas pu être mise à jour.");
            this.goBack();
            return;
          }

          this.infoEditing = false;
          this.photoEditing = false;
          this.photoChanged = false;

          this.toastService.success('Succès', "Les informations et la photo de l'élève ont été mises à jour.");
          this.goBack();
        },

        error: error => {
          this.photoUploading = false;
          this.saving = false;

          console.error('Erreur modification photo :', error);

          this.toastService.warning('Attention', "Les informations ont été modifiées, mais la photo n'a pas pu être mise à jour.");
          this.goBack();
        }
      });
  }

  private buildUpdateEleveRequest(): UpdateEleveRequest {
    const value = this.eleveFormGroup.getRawValue();


    const allergies: string[] = typeof value.allergies === 'string'
      ? value.allergies
        .split(',')
        .map((allergie: string) => allergie.trim())
        .filter((allergie: string) => allergie.length > 0)
      : [];

    return {
      nom: value.nom,
      prenom: value.prenom,
      sexe: value.sexe,
      lieuNaissance: value.lieuNaissance,
      address: value.address,
      nationalite: value.nationalite,
      dateNaissance: value.dateNaissance,
      allergies: allergies
    };
  }


  goBack(): void {
    this.router.navigate(['/admin/dossier-eleve/eleves']);
  }
}
