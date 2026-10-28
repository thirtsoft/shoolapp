import { SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExerciceAddEdit } from '../../../../../core/models/planification/exercice';
import { CreationExerciceRequest } from '../../../../../core/models/planification/exercice/creation-exercice-request.model';
import { GetExerciceResponse } from '../../../../../core/models/planification/exercice/get-exercice-response.model';
import { UpdateExerciceDTO } from '../../../../../core/models/planification/exercice/update-exercice-dto.model';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';


@Component({
  selector: 'app-creation-exercice',
  standalone: true,
  imports: [SlicePipe, ReactiveFormsModule],
  templateUrl: './creation-exercice.component.html',
  styleUrls: ['./creation-exercice.component.css']
})
export class CreationExerciceComponent implements OnInit {

  errorMessage?: string;
  exerciceUuid?: string;
  exerciceFormGroup!: FormGroup;

  exercice?: GetExerciceResponse;

  isEdit = false;

  livreList: any[] = [];

  currentFile: File | null = null;

  existingFileRemoved = false;

  title = 'Ajouter un exercice';

  classeId?: number;
  enseignementActif: number;

  private readonly planification = inject(PlanificationResourceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly classeContext = inject(EnseignementContextService);


  constructor() {
    this.exerciceUuid = this.activeRoute.snapshot.paramMap.get('id') ?? undefined;

    const contexteClasse = this.classeContext.getGestionClasseContext();

    this.classeId = contexteClasse?.classId;

    this.enseignementActif = Number(contexteClasse?.enseignementId);

    console.log('classeId', this.classeId);

    console.log('enseignement active', this.enseignementActif);
  }

  ngOnInit(): void {
    this.initializeForm(null);

    if (this.exerciceUuid) {
      this.isEdit = true;
      this.title = 'Modifier un exercice';
      this.getExercice(this.exerciceUuid);
    }
  }


  private getExercice(exerciceUuid: string): void {
    this.planification.getExerciceByUuId(exerciceUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.toastService.error(
              'Erreur',
              response.message || "Impossible de récupérer l'exercice."
            );
            return;
          }
          this.exercice = response.data;
          this.initializeForm(this.exercice);
        },

        error: error => {
          console.error(
            'Erreur lors de la récupération de l’exercice',
            error
          );
          this.toastService.error(
            'Erreur',
            'Impossible de récupérer l’exercice.'
          );
        }
      });
  }

  initializeForm(exercice: ExerciceAddEdit | null): void {
    this.exerciceFormGroup = this.formBuilder.group({
      id: [exercice?.id ?? ''],
      titre: [exercice?.titre ?? '', Validators.required],
      page: [exercice?.page ?? ''],
      numeroExercice: [exercice?.numeroExercice ?? ''],
      description: [exercice?.description ?? '', Validators.required],
      url: [exercice?.url ?? ''],
      dateDebut: [exercice?.dateDebut ?? '', Validators.required],
      dateFin: [exercice?.dateFin ?? ''],
      livre: [exercice?.livre ?? '']
    });
  }

  onFileSelected(event: Event): void {
    this.errorMessage = undefined;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files.item(0);
    if (!file) {
      return;
    }
    if (file.size > 2097152) {
      this.errorMessage = 'Le fichier ne doit pas dépasser 2 MB.';
      input.value = '';
      return;
    }
    this.currentFile = file;
    this.existingFileRemoved = true;
  }

  ajouteditExerciceWithFiles(): void {
    if (this.exerciceFormGroup.invalid) {
      this.exerciceFormGroup.markAllAsTouched();
      return;
    }
    const exerciceForm = this.exerciceFormGroup.getRawValue();
    const request: CreationExerciceRequest = {
      titre: exerciceForm.titre,
      page: exerciceForm.page,
      description: exerciceForm.description,
      url: exerciceForm.url,
      enseignement: this.enseignementActif,
      livre: exerciceForm.livre,
      dateDebut: exerciceForm.dateDebut,
      dateFin: exerciceForm.dateFin
    };

    if (!this.isEdit) {
      this.creerExercice(request);
      return;
    }

    if (!this.exerciceUuid) {
      this.toastService.error(
        'Erreur',
        "L'identifiant de l'exercice est introuvable."
      );
      return;
    }

    this.modifierExercice(this.exerciceUuid, request);
  }

  private creerExercice(request: CreationExerciceRequest): void {

    const formData = new FormData();

    formData.append(
      'exercice',
      new Blob(
        [JSON.stringify(request)],
        {
          type: 'application/json'
        }
      )
    );

    if (this.currentFile) {
      formData.append('file', this.currentFile);
    }

    this.planification.enregistrerExerciceAvecPiceJointe(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {

            this.toastService.error(
              'Erreur',
              response.message ||
              "Impossible d'enregistrer l'exercice."
            );
            return;
          }

          const data = response.data;

          this.toastService.success(
            'Succès',
            response.message ||
            'Exercice enregistré avec succès.'
          );

          if (data.photoProvided && !data.photoStored) {
            this.toastService.warning(
              'Attention',
              data.photoMessage || "L'exercice a été créé, mais le document n'a pas pu être enregistré."
            );
          }
          this.goBack();
        },

        error: error => {
          console.error(
            'Erreur lors de la création de l’exercice',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ||
            error?.message || "Erreur lors de la création de l'exercice."
          );
        }
      });
  }

  private modifierExercice(exerciceUuid: string, request: UpdateExerciceDTO): void {

    this.planification.modifierExercice(exerciceUuid, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.toastService.error(
              'Erreur',
              response.message ||
              "Impossible de modifier l'exercice."
            );
            return;
          }

          if (this.currentFile) {
            this.modifierDocument(exerciceUuid, this.currentFile);
            return;
          }

          this.toastService.success(
            'Succès',
            response.message || 'Exercice modifié avec succès.'
          );
          this.goBack();
        },

        error: error => {

          console.error(
            'Erreur lors de la modification de l’exercice',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ||
            error?.message || "Erreur lors de la modification de l'exercice."
          );
        }
      });
  }

  private modifierDocument(exerciceUuid: string, file: File): void {

    this.planification.modifierDocumentExercice(exerciceUuid, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: response => {

          if (!response.success || !response.data) {

            this.toastService.error(
              'Erreur',
              response.message || "L'exercice a été modifié, mais le document n'a pas pu être mis à jour."
            );
            return;
          }

          this.toastService.success(
            'Succès',
            'Exercice et document modifiés avec succès.'
          );

          this.goBack();
        },

        error: error => {

          console.error(
            'Erreur lors de la modification du document',
            error
          );

          this.toastService.warning(
            'Attention',
            "L'exercice a été modifié, mais le document n'a pas pu être mis à jour."
          );

          this.goBack();
        }
      });
  }

  removeFileNoApi(fromApi: boolean): void {
    if (fromApi) {
      this.existingFileRemoved = true;
      return;
    }
    this.currentFile = null;
    this.existingFileRemoved = false;
  }

  getFileIcon(filename: string): string {

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


  goBack(): void {
    void this.router.navigate(['/enseignant/gestion-classe', this.classeId]);
  }

}
