import { CommonModule, SlicePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../../../core/constants/constants';
import { ExerciceAddEdit } from '../../../../../core/models/planification/exercice';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { EnseignementContextService } from '../../../service/enseignement-contexte.service';


@Component({
  selector: 'app-creation-exercice',
  standalone: true,
  imports: [CommonModule, SlicePipe, ReactiveFormsModule],
  templateUrl: './creation-exercice.component.html',
  styleUrls: ['./creation-exercice.component.css']
})
export class CreationExerciceComponent implements OnInit {

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
  classeId?: number;
  utilisateur: Utilisateur = {};

  titile: string = '';

  title = "Ajouter un exercice";

  private readonly planification = inject(PlanificationResourceService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classeContext = inject(EnseignementContextService);

  readonly enseignementIdActive = computed(() => {
    const classes = this.classeContext.mesClasses();
    const activeId = this.classeContext.activeClasseId();
    const enseignementActif = classes.find(ens => String(ens.classId) === String(activeId));
    return enseignementActif?.id;
  });


  constructor() {
    this.exerciceId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));

    effect(() => {
      const activeEnseignementId = this.enseignementIdActive();
      if (activeEnseignementId && !this.isEdit && this.exerciceFormGroup) {
        console.log('Mode création - Enseignement ID appliqué automatiquement :', activeEnseignementId);
        this.exerciceFormGroup.get('enseignement')?.setValue(activeEnseignementId);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm(null);
    if (this.exerciceId != null && this.exerciceId != undefined) {
      this.getExercice(this.exerciceId);
      this.title = 'Modifier un exercice';
      this.isEdit = true;
    } else {
      const currentId = this.enseignementIdActive();
      if (currentId) {
        this.exerciceFormGroup.get('enseignement')?.setValue(currentId);
      }
    }
  }


  getExercice(exerciceId: number) {
    this.planification.getExercicet(exerciceId).subscribe({
      next: (data) => {
        this.exercice = data;

        this.initializeForm(this.exercice);

        if (this.exercice?.enseignement) {
          this.exerciceFormGroup.get('enseignement')?.setValue(this.exercice.enseignement);
        }

        if (this.exercice?.piecesJointesDTO?.content) {
        }
      }
    });
  }


  initializeForm(exercice: ExerciceAddEdit | null) {
    this.exerciceFormGroup = this._formBuilder.group({
      id: [exercice?.id ?? ''],
      titre: [exercice?.titre ?? '', Validators.required],
      page: [exercice?.page ?? ''],
      numeroExercice: [exercice?.numeroExercice ?? ''],
      description: [exercice?.description ?? '', Validators.required],
      enseignement: [exercice?.enseignement ?? '', Validators.required],
      url: [exercice?.url ?? ''],
      dateDebut: [exercice?.dateDebut ?? ''],
      dateFin: [exercice?.dateFin ?? ''],
      livre: [exercice?.livre ?? ''],
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

  ajouteditExerciceWithFiles() {
    const formData: FormData = new FormData();
    const payload = this.exerciceFormGroup.value;
    payload.ecole = this.ecoleId;
    payload.createur = this.userId;

    formData.append('file', this.currentFile!);
    formData.append('piecejointeexercice', JSON.stringify(payload));

    if (!this.isEdit) {
      this.planification.enregistrerExercicetWithFiles(formData).subscribe({
        next: (data) => {
          if (data) {
            this.toastService.success('succès', 'L\'exercice a été enregistrées avec succès !!! ');
            this.router.navigate(['enseignant/exercices'])
          } else if (!data) {
            this.toastService.error('error', 'Erreur lors de la création : ' + data);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.planification.updateExercice(this.exerciceId, payload).subscribe({
        next: (data) => {
          if (data && this.currentFile) {
            this.uploadFichierExercice(data);
            this.toastService.success('succès', 'L\'exercice a été modifiées avec succès !!! ');
            this.router.navigate(['enseignant/exercices'])
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
          this.router.navigate(['enseignant/exercices']);
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
    this.router.navigate(['enseignant/exercices'])
  }


}
