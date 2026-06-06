import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../../../../core/constants/constants';
import { Enseignant } from '../../../../../../core/models/enseignant/enseignant';
import { Enseignement } from '../../../../../../core/models/planification/enseignement';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { NiveauEducation } from '../../../../../../core/models/referentiels/niveau-eduction';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';


@Component({
  selector: 'app-create-enseignant',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-enseignant.component.html',
  styleUrls: ['./create-enseignant.component.css']
})
export class CreateEnseignantComponent implements OnInit {

  errorMessage?: string;
  enseignantFormGroup!: FormGroup;
  enseignant?: Enseignant = {};
  enseignantId?: number;
  civilites?: string[] = ["M.", "Me"];
  listEducations: NiveauEducation[] = [];
  userId?: any;
  classeList: ListeClasse[] = [];
  anneeScolaireList: AnneeScolaire[] = [];
  enseignementId?: number;
  enseignement?: Enseignement;

  currentFile?: File;
  message = '';
  preview = '';

  title = "Ajouter un enseignant";

  private readonly referentielService = inject(ReferentielService);
  private readonly enseignanService = inject(EnseignantService);
  private readonly pieceJointeService = inject(PieceJointeService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    this.enseignantId = this.activeRoute.snapshot.params['id'];
    this.loadReferentiels();
    this.initializeForm(null);
    if (this.enseignantId != null && this.enseignantId != undefined) {
      this.getEnseignantById(this.enseignantId);
      this.title = 'Modifier un enseignant';
    }
  }

  private loadReferentiels() {
    this.referentielService.getAllNiveauEducations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.listEducations = data
    });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.enseignantFormGroup.get('niveauEducation')?.value;
    const niveau = this.listEducations.find(c => Number(c.id) === Number(niveauId));
    return niveau?.libelle || '';
  }


  initializeForm(enseignant: Enseignant | null) {
    this.enseignantFormGroup = this._formBuilder.group({
      id: [enseignant?.id ? enseignant.id : ''],
      civilite: [enseignant?.civilite ? enseignant.civilite : ''],
      nom: [enseignant?.nom ? enseignant.nom : '', Validators.required],
      prenom: [enseignant?.prenom ? enseignant.prenom : '', Validators.required],
      address: [enseignant?.address ? enseignant.address : ''],
      email: [enseignant?.email ? enseignant.email : '', Validators.required],
      telephone: [enseignant?.telephone ? enseignant.telephone : '', Validators.required],
      username: [enseignant?.username ? enseignant.username : '', Validators.required],
      profession: [enseignant?.profession ? enseignant.profession : ''],
      situationMatrimoniale: [enseignant?.situationMatrimoniale ? enseignant.situationMatrimoniale : ''],
      cni: [enseignant?.cni ? enseignant.cni : '', Validators.required],
      niveauEducation: [enseignant?.niveauEducation ? enseignant.niveauEducation : '', Validators.required],
      //    dateDebut: [moment(enseignant?.dateDebut).format('YYYY-MM-DD')],
      dateDebut: [enseignant?.dateDebut],
      dateFin: [enseignant?.dateFin ? enseignant.dateFin : ''],
    });
  }


  getEnseignantById(enseignantId: number) {
    this.enseignanService.getEnseigant(enseignantId).subscribe({
      next: (data) => {
        this.enseignant = data;
        this.userId = this.enseignant.userId;
        this.initializeForm(this.enseignant);

        if (this.enseignant?.piecesJointesDTO?.content) {
          this.preview = 'data:image/png;base64,' + this.enseignant.piecesJointesDTO.content;
        }
      }
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

  ajoutereditEnseignant() {
    const formData: FormData = new FormData();
    const payload: Enseignant = {
      id: this.enseignantFormGroup.get("id")!.value,
      civilite: this.enseignantFormGroup.get("civilite")!.value,
      nom: this.enseignantFormGroup.get("nom")!.value,
      prenom: this.enseignantFormGroup.get("prenom")!.value,
      address: this.enseignantFormGroup.get("address")!.value,
      email: this.enseignantFormGroup.get("email")!.value,
      telephone: this.enseignantFormGroup.get("telephone")!.value,
      username: this.enseignantFormGroup.get("username")!.value,
      profession: this.enseignantFormGroup.get("profession")!.value,
      situationMatrimoniale: this.enseignantFormGroup.get("situationMatrimoniale")!.value,
      cni: this.enseignantFormGroup.get("cni")!.value,
      niveauEducation: this.enseignantFormGroup.get("niveauEducation")!.value,
      dateDebut: this.enseignantFormGroup.get("dateDebut")!.value,
      dateFin: this.enseignantFormGroup.get("dateFin")!.value,
    }
    payload.userId = this.userId;
    if (this.enseignantId === null || this.enseignantId === undefined) {
      formData.append('file', this.currentFile!);
      formData.append('piecejointeenseignant', JSON.stringify(payload));
      this.enseignanService.enregistrerUnEnseignantWithFiles(formData).subscribe({
        next: (data) => {
          if (data) {
            this.enseignantId = data;
            this.toastService.success('success', 'Le compte de l\'enseignant a été crée avec succès.');
            this.router.navigate(['/admin/utilisateur/enseignants']);
          } else if (!data) {
            this.toastService.warning('error', 'Erreur lors de la création : ' + data);
          }
        },
        error: (data: any) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.enseignanService.updateEnseigant(this.enseignantId, payload).subscribe({
        next: data => {
          if (this.currentFile) {
            this.uploadPhotoEnseignant(data);
            this.toastService.success('success', 'Le compte de l\'enseignant a été modifié avec succès.');
            this.router.navigate(['/admin/utilisateur/enseignants']);
          }
        },
        error: (data: any) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }
  }

  uploadPhotoEnseignant(eleveId: number) {
    if (this.currentFile) {
      const piecesJointesDTO = {
        objectId: eleveId,
        dossier: "pieces_jointes",
        typeDocumentId: Constants.TYPE_PHOTO_ENSEIGNANT,
        nomFichier: this.currentFile.name,
      };

      this.pieceJointeService.uploadUnePieceJointe(this.currentFile, piecesJointesDTO).subscribe({
        next: () => {
          this.toastService.success('Succès', 'Photo de profil mise à jour avec succès');
          this.router.navigate(['/admin/utilisateur/enseignant']);
        },
        error: error => {
          console.log(error);
          this.toastService.error('Erreur', 'Erreur lors de l\'upload de la photo');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/utilisateur/enseignants']);
  }



}
