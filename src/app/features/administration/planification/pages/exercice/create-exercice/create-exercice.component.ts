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

  /*
  errorMessage?: string;
  exerciceId: number;
  exerciceFormGroup!: FormGroup;
  exercice?: ExerciceAddEdit;
  isEdit: boolean = false;
  livreList: any;
  enseignementList: ListeEnseignement[] = [];
  classeList: ListeClasse[] = [];

  currentFile: File | null = null;
  message = '';
  preview = '';

  ecoleId: any;
  userId?: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter un exercice";

  private readonly planification = inject(PlanificationResourceService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);


  constructor(
  ) {
    this.exerciceId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.chargerLesDonnees();
    this.initializeForm(null);
    if (this.exerciceId != null && this.exerciceId != undefined) {
      this.getExercice(this.exerciceId);
      this.title = 'Modifier un exercice';
      this.isEdit = true;
    }
  }

  private chargerLesDonnees() {
    this.utilisateurService.getUtilisateur(this.userId!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.utilisateur = data
    });
    this.referentielService.getResourceList('classe').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.classeList = data
    });
  }

  private getEnseignementByClass(classId: number) {
    this.planification.getAllEnseignementByclasse(classId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.enseignementList = data;
      }
    });
  }

  onClasseSelected() {
    const classId = this.exerciceFormGroup.get('classId')?.value;
    if (classId) {
      this.getEnseignementByClass(classId);
    }

    if (this.isEdit && this.exercice?.enseignement) {
      this.exerciceFormGroup.patchValue({
        enseignement: this.exercice.enseignement
      });
    }

  }

  getExercice(exerciceId: number) {
    this.planification.getExercicet(exerciceId).subscribe({
      next: (data) => {
        this.exercice = data;

        this.initializeForm(this.exercice);

        if (this.exercice?.classId && this.exercice?.enseignement) {
          this.getEnseignementByClass(this.exercice.classId);
          this.exerciceFormGroup.get('enseignement')?.setValue(this.exercice?.enseignement);
        }

        if (this.exercice?.piecesJointesDTO?.content) {
        }
      }
    });
  }


  initializeForm(exercice: ExerciceAddEdit | null) {
    this.exerciceFormGroup = this._formBuilder.group({
      id: [exercice?.id ? exercice.id : ''],
      titre: [exercice?.titre ? exercice.titre : '', Validators.required],
      classId: [exercice?.classId ? exercice.classId : '', Validators.required],
      page: [exercice?.page ? exercice.page : ''],
      numeroExercice: [exercice?.numeroExercice ? exercice.numeroExercice : ''],
      description: [exercice?.description ? exercice.description : '', Validators.required],
      url: [exercice?.url ? exercice.url : ''],
      dateDebut: [exercice?.dateDebut ? exercice.dateDebut : ''],
      dateFin: [exercice?.description ? exercice.dateFin : ''],
      enseignement: [exercice?.enseignement ? exercice.enseignement : '', Validators.required],
      livre: [exercice?.livre ? exercice.livre : ''],
    });
  }

  onFileSelected(event: any): void {
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.item(0)) {
      const file: File = selectedFiles.item(0);

      if (file.size > 2097152) { // 2MB en octets
        this.errorMessage = 'L\'image ne doit pas dépasser 2MB!';
        return;
      }

      this.currentFile = file;
    }
  }

  ajouteditExercice() {
    const payload = this.exerciceFormGroup.value;
    payload.ecole = this.ecoleId;
    payload.createur = this.userId;
    if (!this.isEdit) {
      this.planification.createRessource('exercice', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\'exercice a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/planification/exercice'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.planification.updateResource('exercice', this.exerciceId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\'exercice a été modifiées avec succès !!! ');
            this.router.navigate(['admin/planification/exercice'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
        }
      });

    }
  }

  ajouteditExerciceWithFiles() {

    if (!this.exerciceFormGroup.valid) {
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

    const formData: FormData = new FormData();

    formData.append(
      'exercice',
      new Blob(
        [
          JSON.stringify(request)
        ],
        { type: 'application/json' }
      )
    );

    if (this.currentFile) {
      formData.append('file', this.currentFile);
    }

    if (!this.isEdit) {

      this.planification.enregistrerExerciceAvecPiceJointe(formData).subscribe({
        next: response => {

          if (!response.success || !response.data) {

            this.toastService.error(
              'Erreur',
              response.message || "Impossible d'enregistrer l'exercice."
            );
            return;
          }
          const data = response.data;

          this.toastService.success(
            'Succès',
            response.message || "L\'exercice a été enregistrées avec succès !!! ."
          );

          if (data.photoProvided && !data.photoStored) {
            this.toastService.warning(
              'Attention',
              data.photoMessage || "L\'exercice a été créé, mais la pièce jointe n'a pas pu être enregistrée."
            );
          }

          this.goBack();
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.planification.updateExercice(this.exerciceId, request).subscribe({
        next: (data) => {
          if (data && this.currentFile) {
            this.uploadFichierExercice(data);
            this.toastService.success('succès', 'L\'exercice a été modifiées avec succès !!! ');
            this.router.navigate(['admin/planification/exercice'])
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
        }
      });

    }
  }

  uploadFichierExercice(exerciceId: number) {
    if (this.currentFile) {
      const piecesJointesDTO = {
        objectId: exerciceId,
        dossier: "pieces_jointes",
        typeDocumentId: Constants.TYPE_DOCUMETNT_EXERCICE,
        nomFichier: this.currentFile.name,
      };

      this.pieceJointeService.uploadUnePieceJointe(this.currentFile, piecesJointesDTO).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Fichier exercice mise à jour avec succès');
          this.router.navigate(['/admin/planification/exercice']);
        },
        error: error => {
          console.log(error);
          this.toastService.error('Erreur', 'Erreur lors de l\'upload de la photo');
        }
      });
    }
  }

  removeFileNoApi(fromApi: boolean): void {
    if (fromApi) {
      this.currentFile = null;
    } else {
      this.currentFile = null;
    }
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

  goBack() {
    this.router.navigate(['admin/planification/exercice'])
  }
  */


}
