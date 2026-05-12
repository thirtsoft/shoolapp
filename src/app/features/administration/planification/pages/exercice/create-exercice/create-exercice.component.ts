import { CommonModule, SlicePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Constants } from '../../../../../../core/constants/constants';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';
import { Exercice } from '../../../../../../core/models/planification/exercice';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-exercice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlicePipe],
  templateUrl: './create-exercice.component.html',
  styleUrls: ['./create-exercice.component.css']
})
export class CreateExerciceComponent implements OnInit {

  errorMessage?: string;
  exerciceId: number;
  exerciceFormGroup!: FormGroup;
  exercice?: Exercice;
  isEdit: boolean = false;
  classeList: ListeClasse[] = [];
  livreList: any;
  enseigantList: EnseigantList[] = [];

  currentFile: File | null = null;
  message = '';
  preview = '';

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Ajouter un exercice";

  private readonly planification = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  //  private readonly enseignantService = inject(EnseignantService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.exerciceId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClasseList();
    this.getLivreList();
    //  this.getEnseignantList();
    this.initializeForm(null);
    if (this.exerciceId != null && this.exerciceId != undefined) {
      this.getExercice(this.exerciceId);
      this.title = 'Modifier un exercice';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
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

  /*
  getEnseignantList() {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (data: any) => {
        this.enseigantList = data;
      }
    });
  }*/

  getExercice(exerciceId: number) {
    this.planification.getExercicet(exerciceId).subscribe({
      next: (data) => {
        this.exercice = data;
        this.initializeForm(this.exercice);
        console.log("Details exercice {} ", this.exercice);

        if (this.exercice?.piecesJointesDTO?.content) {
        }
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
      enseignant: [exercice?.enseignant ? exercice.enseignant : '', Validators.required],
      classe: [exercice?.classe ? exercice.classe : '', Validators.required],
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
    console.log("Le fichier choisi est ", this.currentFile);
  }

  ajouteditExercice() {
    const payload = this.exerciceFormGroup.value;
    payload.ecole = this.ecoleId;
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
      payload.ecole = this.ecoleId;
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
    if (!this.isEdit) {
      formData.append('file', this.currentFile!);
      formData.append('piecejointeexercice', JSON.stringify(payload));
      this.planification.enregistrerExercicetWithFiles(formData).subscribe({
        next: (data) => {
          if (data) {
            this.toastService.success('succès', 'L\'exercice a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/planification/exercice'])
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


}
