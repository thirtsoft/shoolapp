import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Constants } from '../../../../../core/constants/constants';
import { EleveEdit } from '../../../../../core/models/dossiereleve/request/eleve-edit';
import { Eleve } from '../../../../../core/models/parent/parent';
import { PieceJointeService } from '../../../../../core/services/piece-jointe';
import { DossierEleveService } from '../../service/dossier-eleve.service';

@Component({
  selector: 'app-creation-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './creation-eleve.component.html',
  styleUrls: ['./creation-eleve.component.css']
})
export class CreationEleveComponent implements OnInit {

  eleveFormGroup!: FormGroup;
  errorMessage?: string;
  eleve?: EleveEdit = {};
  eleveId?: number;
  typeSexe?: string[] = ["Masculin", "Féminin"];
  today = new Date();

  title = "Création d'un élève";

  userId?: number;

  currentFile?: File;
  message = '';
  preview = '';

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly pieceJointeService = inject(PieceJointeService);
  //  private readonly localStorage = inject(LocalStorageService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);



  ngOnInit(): void {
    //    this.userId = this.localStorage.getItem('id');
    this.eleveId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm(null);
    if (this.eleveId !== null && this.eleveId > 0) {
      this.getEleveById(this.eleveId);
      this.title = 'Modification d\'un élève';
    }
  }

  getEleveById(eleveId: number) {
    this.dossierEleveService.getEleveToEdit(eleveId).subscribe({
      next: (data) => {
        this.eleve = data;
        console.log("editer eleve", this.eleve);
        this.initializeForm(this.eleve);

        if (this.eleve?.piecesJointesDTO?.content) {
          this.preview = 'data:image/png;base64,' + this.eleve.piecesJointesDTO.content;
        }
      }
    });
  }

  initializeForm(eleve: Eleve | null) {
    this.eleveFormGroup = this._formBuilder.group({
      id: [eleve?.id ? eleve.id : ''],
      prenom: [eleve?.prenom ? eleve.prenom : '', Validators.required],
      nom: [eleve?.nom ? eleve.nom : '', Validators.required],
      sexe: [eleve?.sexe ? eleve.sexe : '', Validators.required],
      lieuNaissance: [eleve?.lieuNaissance ? eleve.lieuNaissance : '', Validators.required],
      address: [eleve?.address ? eleve.address : ''],
      dateNaissance: [eleve?.dateNaissance],
      //    dateNaissance: [moment(eleve?.dateNaissance).format('YYYY-MM-DD')],
      nationalite: [eleve?.nationalite ? eleve.nationalite : ''],
    });
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.item(0)) {
      const file: File = selectedFiles.item(0);

      if (!file.type.match('image.*')) {
        this.message = 'Seules les images sont autorisées!';
        return;
      }

      if (file.size > 2097152) { // 2MB en octets
        this.message = 'L\'image ne doit pas dépasser 2MB!';
        return;
      }

      this.currentFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.currentFile);
    }
    console.log("Le fichier choisi est ", this.currentFile);
  }

  ajouterEleve() {
    const payload = this.eleveFormGroup.value;
    console.log('payload');
    this.dossierEleveService.editEleve(this.eleveId!, payload).subscribe({
      next: data => {
        this.toastService.success('success', 'Les informations du patient ont été mise à jour avec succès,');
        this.router.navigate(['/admin/dossier-eleve/eleves']);
      },
      error: error => {
        console.log(error);
        this.toastService.error('error', ` Erreur lors de la mise à jour des informations du patient, Veuillez reessayer ulterieurement`);
      }
    });
  }

  editerUnEleve() {
    const payload = this.eleveFormGroup.value;
    if (this.eleveId !== null && this.eleveId! > 0) {
      this.dossierEleveService.editEleve(this.eleveId!, payload).subscribe({
        next: data => {
          if (this.currentFile) {
            this.uploadPhotoEleve(data.eleve);
          } else {
            this.toastService.success('Succès', 'Les informations de l\'élève ont été mises à jour avec succès.');
            this.router.navigate(['/admin/dossier-eleve/eleves']);
          }
        },
        error: error => {
          console.log(error);
          this.toastService.error('Erreur', 'Erreur lors de la mise à jour des informations de l\'élève');
        }
      });
    }
  }

  // Méthode pour uploader la photo
  uploadPhotoEleve(eleveId: number) {
    if (this.currentFile) {
      const piecesJointesDTO = {
        objectId: eleveId,
        dossier: "pieces_jointes",
        typeDocumentId: Constants.TYPE_PHOTO_ELEVE,
        nomFichier: this.currentFile.name,
      };

      this.pieceJointeService.uploadUnePieceJointe(this.currentFile, piecesJointesDTO).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Photo de profil mise à jour avec succès');
          this.router.navigate(['/admin/dossier-eleve/eleves']);
        },
        error: error => {
          console.log(error);
          this.toastService.error('Erreur', 'Erreur lors de l\'upload de la photo');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/dossier-eleve/eleves']);
  }


}
