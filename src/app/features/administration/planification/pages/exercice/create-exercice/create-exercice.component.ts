import { CommonModule, SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../../../../core/constants/constants';
import { ExerciceAddEdit } from '../../../../../../core/models/planification/exercice';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { CreationExerciceRequest } from '../../../../../../core/models/planification/exercice/creation-exercice-request.model';
import { UpdateExerciceDTO } from '../../../../../../core/models/planification/exercice/update-exercice-dto.model';
import { GetExerciceResponse } from '../../../../../../core/models/planification/exercice/get-exercice-response.model';

@Component({
  selector: 'app-create-exercice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlicePipe],
  templateUrl: './create-exercice.component.html',
  styleUrls: ['./create-exercice.component.css']
})
export class CreateExerciceComponent implements OnInit {

  errorMessage?: string;
  exerciceUuid?: string;
  exerciceFormGroup!: FormGroup;

  exercice?: GetExerciceResponse;

  isEdit = false;

  livreList: any[] = [];
  enseignementList: ListeEnseignement[] = [];
  classeList: ListeClasse[] = [];

  currentFile: File | null = null;

  existingFileRemoved = false;

  utilisateur: Utilisateur = {};

  title = 'Ajouter un exercice';

  private readonly planification = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);


  constructor() {
    this.exerciceUuid = this.activeRoute.snapshot.paramMap.get('id') ?? undefined;
  }

  ngOnInit(): void {
    this.chargerLesDonnees();
    this.initializeForm(null);

    if (this.exerciceUuid) {
      this.isEdit = true;
      this.title = 'Modifier un exercice';
      this.getExercice(this.exerciceUuid);
    }
  }

  private chargerLesDonnees(): void {
    const userId = Number(localStorage.getItem('id'));
    if (userId) {
      this.utilisateurService.getUtilisateur(userId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            this.utilisateur = data;
          },
          error: error => {
            console.error(
              'Erreur lors du chargement de l’utilisateur',
              error
            );
          }
        });
    }

    this.referentielService.getResourceList('classe')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.classeList = data;
        },
        error: error => {
          console.error('Erreur lors du chargement des classes', error);
        }
      });
  }

  private getEnseignementByClass(classId: number): void {
    this.planification.getAllEnseignementByclasse(classId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.enseignementList = data;
        },
        error: error => {
          console.error('Erreur lors du chargement des enseignements', error);
        }
      });
  }

  onClasseSelected(): void {
    const classId = this.exerciceFormGroup.get('classId')?.value;
    if (!classId) {
      this.enseignementList = [];
      this.exerciceFormGroup.get('enseignement')?.setValue('');
      return;
    }
    this.getEnseignementByClass(Number(classId));
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

          if (this.exercice.classId && this.exercice.enseignement) {
            this.getEnseignementByClass(Number(this.exercice.classId));
            this.exerciceFormGroup.get('enseignement')?.setValue(this.exercice.enseignement);
          }
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
      classId: [exercice?.classId ?? '', Validators.required],
      page: [exercice?.page ?? ''],
      numeroExercice: [exercice?.numeroExercice ?? ''],
      description: [exercice?.description ?? '', Validators.required],
      url: [exercice?.url ?? ''],
      dateDebut: [exercice?.dateDebut ?? '', Validators.required],
      dateFin: [exercice?.dateFin ?? ''],
      enseignement: [exercice?.enseignement ?? '', Validators.required],
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
      enseignement: exerciceForm.enseignement,
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
    this.router.navigate(['admin/planification/exercice']);
  }


}
