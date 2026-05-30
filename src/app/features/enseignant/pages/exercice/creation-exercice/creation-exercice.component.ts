import { CommonModule, SlicePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../../../core/constants/constants';
import { DetailsEnseignantUtilisateur } from '../../../../../core/models/enseignant/details-enseignant-utilisateur';
import { EnseigantList } from '../../../../../core/models/enseignant/enseignant-list';
import { Exercice } from '../../../../../core/models/planification/exercice';
import { ListeEnseignement } from '../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { EnseignantService } from '../../../service/enseignant.service';


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
  exercice: Exercice = {};
  isEdit: boolean = false;

  classeList: ListeClasse[] = [];
  livreList: any;
  enseigantList: EnseigantList[] = [];
  enseignementList: ListeEnseignement[] = [];

  currentFile: File | null = null;
  message = '';
  preview = '';

  title = "Ajouter un exercice";
  detailsEnseignant: DetailsEnseignantUtilisateur = {};
  enseignantId?: number;
  userId?: number;

  private readonly referentielService = inject(ReferentielService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly toastService = inject(ToastrService)
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);

  constructor(
  ) {
    this.exerciceId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getClasseList();
    this.getLivreList();
    this.getEnseignementByUtilisateur(this.userId!);
    this.initializeForm(null);
    if (this.exerciceId != null && this.exerciceId != undefined) {
      this.getExercice(this.exerciceId);
      this.title = 'Modifier un exercice';
      this.isEdit = true;
    }
  }

  getEnseignementByUtilisateur(userId: number) {
    this.enseignantService.getDetailsEnseignantUtilisateur(userId).subscribe({
      next: (data) => {
        this.detailsEnseignant = data;
        console.log('enseignement', data);
        this.enseignantId = this.detailsEnseignant?.id;
        this.getEnseignementList(this.enseignantId!);
      },
      error: (err) => (err)
    });
  }

  getEnseignementList(ensId: number) {
    this.planification.getAllEnseignementByEnseignant(ensId).subscribe({
      next: (data) => {
        this.enseignementList = data;
        console.log('List enseignement', data);
      }
    });
  }

  getClasseList() {
    this.referentielService.getAllClasses().subscribe({
      next: (data) => {
        this.classeList = data;
      }
    });
  }

  getLivreList() {
    this.planification.getResourceList('livre').subscribe({
      next: (data) => {
        this.livreList = data;
      }
    });
  }

  getExercice(exerciceId: number) {
    this.planification.getExercicet(exerciceId).subscribe({
      next: (data) => {
        this.exercice = data;
        this.initializeForm(this.exercice);
        console.log("Details exercice {} ", this.exercice);

        if (this.exercice?.piecesJointesDTO?.content) { }
      }
    });
  }


  initializeForm(exercice: Exercice | null) {
    this.exerciceFormGroup = this._formBuilder.group({
      id: [exercice?.id ? exercice.id : ''],
      titre: [exercice?.titre ? exercice.titre : '', Validators.required],
      page: [exercice?.page ? exercice.page : ''],
      numeroExercice: [exercice?.numeroExercice ? exercice.numeroExercice : ''],
      description: [exercice?.description ? exercice.description : '', Validators.required],
      url: [exercice?.url ? exercice.url : ''],
      dateDebut: [exercice?.dateDebut ? exercice.dateDebut : ''],
      dateFin: [exercice?.description ? exercice.dateFin : ''],
      classe: [exercice?.classe ? exercice.classe : '', Validators.required],
      livre: [exercice?.livre ? exercice.livre : ''],
    });
  }

  onFileSelected(event: any): void {
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.item(0)) {
      const file: File = selectedFiles.item(0);

      if (file.size > 2097152) {
        this.errorMessage = 'L\'image ne doit pas dépasser 2MB!';
        return;
      }

      this.currentFile = file;
    }
    console.log("Le fichier choisi est ", this.currentFile);
  }

  ajouteditExercice() {
    const payload = this.exerciceFormGroup.value;
    payload.enseignant = this.enseignantId;
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
    const formData: FormData = new FormData();
    const payload = this.exerciceFormGroup.value;
    payload.enseignant = this.enseignantId;
    if (!this.isEdit) {
      formData.append('file', this.currentFile!);
      formData.append('piecejointeexercice', JSON.stringify(payload));
      this.planification.enregistrerExercicetWithFiles(formData).subscribe({
        next: (data) => {
          if (data) {
            this.toastService.success('succès', 'L\'exercice a été enregistrées avec succès !!! ');
            this.goBack();
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
            this.goBack();
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
        next: () => { },
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
