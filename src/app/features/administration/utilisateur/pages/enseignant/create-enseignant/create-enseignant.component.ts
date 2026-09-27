import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../../../../core/constants/constants';
import { Enseignant } from '../../../../../../core/models/enseignant/enseignant';
import { EnseignantCreateRequest } from '../../../../../../core/models/enseignant/enseignant-request.model';
import { Enseignement } from '../../../../../../core/models/planification/enseignement';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { NiveauEducation } from '../../../../../../core/models/referentiels/niveau-eduction';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { EnseignantUpdateRequest } from '../../../../../../core/models/enseignant/enseignant-update-request.model';
import { DossierEleveService } from '../../../../dossier-eleve/service/dossier-eleve.service';
import { GetEnseignantResponse } from '../../../../../../core/models/enseignant/get-enseignant-response.model';


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
  enseignantUuid?: string;
  civilites?: string[] = ['M.', 'Me'];
  listEducations: NiveauEducation[] = [];
  classeList: ListeClasse[] = [];
  anneeScolaireList: AnneeScolaire[] = [];

  enseignementId?: number;
  enseignement?: Enseignement;

  currentFile?: File;

  message = '';
  preview = '';
  photoChanged = false;

  photoUploading = false;

  title = 'Ajouter un enseignant';

  private readonly referentielService = inject(ReferentielService);
  private readonly enseignantService = inject(EnseignantService);
  private readonly toastService = inject(ToastrService);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.enseignantUuid = this.activeRoute.snapshot.params['uuid'];

    this.loadReferentiels();

    this.initializeForm();
    if (this.enseignantUuid) {
      this.title = 'Modifier un enseignant';
      this.getEnseignantByUuid(this.enseignantUuid);
    }
  }

  private loadReferentiels(): void {
    this.referentielService.getAllNiveauEducations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.listEducations = data;
        },
        error: error => {
          console.error('Erreur lors du chargement des niveaux d’éducation', error);
        }
      });
  }

  getSelectedNiveauName(): string {
    const niveauId = this.enseignantFormGroup.get('niveauEducation')?.value;
    const niveau = this.listEducations.find(
      c => Number(c.id) === Number(niveauId)
    );
    return niveau?.libelle || '';
  }

  private initializeForm(): void {
    this.enseignantFormGroup = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [''],
      email: [''],
      mobile: ['', Validators.required],
      situationMatrimoniale: [''],
      cni: ['', Validators.required],
      niveauEducation: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['']
    });
  }

  private getEnseignantByUuid(enseignantUuid: string): void {
    this.enseignantService.getEnseignantByUuid(enseignantUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const data = response.data;
          if (!data) {
            this.toastService.error(
              'Erreur',
              'Les informations de l’enseignant sont introuvables.'
            );
            return;
          }
          this.enseignant = data as any;

          /*     this.enseignantFormGroup.patchValue({
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                address: data.address ?? '',
                email: data.email ?? '',
                mobile: data.mobile ?? '',
                situationMatrimoniale: data.situationMatrimoniale ?? '',
                cni: data.cni ?? '',
                niveauEducation: data.niveauEducation ?? '',
                dateDebut: data.dateDebut ?? '',
                dateFin: data.dateFin ?? ''
              }); */
          this.patchEnseignantForm(data);
          this.loadPhoto(response.data);

          /*     if (data.photo && data.photo.available && data.photo.url) {
                this.preview = data.photo.url;
              } */
        },

        error: error => {
          console.error(
            'Erreur lors du chargement de l’enseignant',
            error
          );
          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Impossible de charger les informations de l’enseignant.'
          );
        }
      });
  }

  private patchEnseignantForm(data: GetEnseignantResponse): void {
    this.enseignantFormGroup.patchValue({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      address: data.address ?? '',
      email: data.email ?? '',
      mobile: data.mobile ?? '',
      situationMatrimoniale: data.situationMatrimoniale ?? '',
      cni: data.cni ?? '',
      niveauEducation: data.niveauEducation ?? '',
      dateDebut: data.dateDebut ?? '',
      dateFin: data.dateFin ?? ''
    });
  }

  private loadPhoto(enseignant: GetEnseignantResponse): void {
    this.preview = '';
    this.currentFile = undefined;
    this.photoChanged = false;

    if (enseignant.photo?.available && enseignant.photo.photoUuid) {

      this.dossierEleveService.getPhotoContent(enseignant.photo.photoUuid)
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

  selectFile(event: any): void {
    this.message = '';
    const selectedFiles = event.target.files;
    if (!selectedFiles || !selectedFiles.item(0)) {
      return;
    }
    const file: File = selectedFiles.item(0);
    if (!file.type.match('image.*')) {
      this.message = 'Seules les images sont autorisées!';
      return;
    }

    if (file.size > 2097152) {
      this.message = 'L\'image ne doit pas dépasser 2MB!';
      return;
    }

    this.currentFile = file;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.preview = e.target.result;
    };

    reader.readAsDataURL(file);

    console.log('Le fichier choisi est ', this.currentFile);
  }

  ajoutereditEnseignant(): void {
    if (!this.enseignantFormGroup.valid) {
      this.enseignantFormGroup.markAllAsTouched();
      return;
    }

    const payload: EnseignantCreateRequest = {
      firstName: this.enseignantFormGroup.get('firstName')?.value,
      lastName: this.enseignantFormGroup.get('lastName')?.value,
      address: this.enseignantFormGroup.get('address')?.value,
      email: this.enseignantFormGroup.get('email')?.value,
      mobile: this.enseignantFormGroup.get('mobile')?.value,
      situationMatrimoniale: this.enseignantFormGroup.get('situationMatrimoniale')?.value,
      cni: this.enseignantFormGroup.get('cni')?.value,
      niveauEducation: this.enseignantFormGroup.get('niveauEducation')?.value,
      dateDebut: this.enseignantFormGroup.get('dateDebut')?.value,
      dateFin: this.enseignantFormGroup.get('dateFin')?.value
    };

    if (!this.enseignantUuid) {
      const formData = new FormData();

      if (this.currentFile) {
        formData.append('file', this.currentFile);
      }

      formData.append(
        'enseignant',
        new Blob(
          [
            JSON.stringify(payload)
          ],
          { type: 'application/json' }
        )
      );


      /*     formData.append(
            'enseignant',
            JSON.stringify(payload)
          ); */

      console.log('Payload création enseignant :', payload);

      this.enseignantService.enregistrerEnseignantAvecPhotoFiles(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({

          next: response => {
            const data = response.data;
            if (!data) {
              this.toastService.warning(
                'Attention',
                'La création de l’enseignant n’a pas retourné de données.'
              );
              return;
            }

            this.enseignantUuid = data.enseignantUuid;
            this.toastService.success(
              'Succès',
              'Le compte de l’enseignant a été créé avec succès.'
            );
            this.goBack();
          },

          error: error => {
            console.error(
              'Erreur lors de la création de l’enseignant',
              error
            );

            this.toastService.error(
              'Erreur',
              error?.error?.message ??
              'Erreur lors de la création de l’enseignant.'
            );
          }
        });

      return;
    }

    const updatePayload: EnseignantUpdateRequest = {
      firstName: this.enseignantFormGroup.get('firstName')?.value,
      lastName: this.enseignantFormGroup.get('lastName')?.value,
      address: this.enseignantFormGroup.get('address')?.value,
      email: this.enseignantFormGroup.get('email')?.value,
      mobile: this.enseignantFormGroup.get('mobile')?.value,
      situationMatrimoniale: this.enseignantFormGroup.get('situationMatrimoniale')?.value,
      cni: this.enseignantFormGroup.get('cni')?.value,
      niveauEducation: this.enseignantFormGroup.get('niveauEducation')?.value,
      dateDebut: this.enseignantFormGroup.get('dateDebut')?.value,
      dateFin: this.enseignantFormGroup.get('dateFin')?.value
    };

    console.log('Payload modification enseignant :', updatePayload);

    this.enseignantService.modifierEnseignant(this.enseignantUuid, updatePayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          if (this.currentFile) {
            this.uploadPhotoEnseignant(this.enseignantUuid!);
            return;
          }

          this.toastService.success(
            'Succès',
            'Le compte de l’enseignant a été modifié avec succès.'
          );

          this.goBack();

        },

        error: error => {
          console.error(
            'Erreur lors de la modification de l’enseignant',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Erreur lors de la modification de l’enseignant.'
          );
        }
      });
  }

  private uploadPhotoEnseignant(enseignantUuid: string): void {
    if (!this.currentFile) {
      return;
    }

    this.enseignantService.modifierPhotoEnseignant(enseignantUuid, this.currentFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          this.toastService.success(
            'Succès',
            'Le compte de l’enseignant et sa photo ont été modifiés avec succès.'
          );

          this.goBack();
        },

        error: error => {
          console.error(
            'Erreur lors de la mise à jour de la photo',
            error
          );
          this.toastService.error(
            'Erreur',
            error?.error?.message ??
            'Erreur lors de la mise à jour de la photo.'
          );
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/utilisateur/enseignants']);
  }



  /*
  errorMessage?: string;
  enseignantFormGroup!: FormGroup;
  enseignant?: Enseignant = {};
  enseignantId?: number;
  civilites?: string[] = ["M.", "Me"];
  listEducations: NiveauEducation[] = [];
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


  initializeForm(enseignant: EnseignantCreateRequest | null) {
    this.enseignantFormGroup = this._formBuilder.group({
      id: [enseignant?.id ? enseignant.id : ''],
      firstName: [enseignant?.firstName ? enseignant.firstName : '', Validators.required],
      lastName: [enseignant?.lastName ? enseignant.lastName : '', Validators.required],
      address: [enseignant?.address ? enseignant.address : ''],
      email: [enseignant?.email ? enseignant.email : ''],
      mobile: [enseignant?.mobile ? enseignant.mobile : '', Validators.required],
      situationMatrimoniale: [enseignant?.situationMatrimoniale ? enseignant.situationMatrimoniale : ''],
      cni: [enseignant?.cni ? enseignant.cni : '', Validators.required],
      niveauEducation: [enseignant?.niveauEducation ? enseignant.niveauEducation : '', Validators.required],
      dateDebut: [enseignant?.dateDebut, Validators.required],
      dateFin: [enseignant?.dateFin ? enseignant.dateFin : ''],
    });
  }

  getEnseignantById(enseignantId: number) {
    this.enseignanService.getEnseigant(enseignantId).subscribe({
      next: (data) => {
        this.enseignant = data;
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
    if (!this.enseignantFormGroup.valid) {
      this.enseignantFormGroup.markAllAsTouched();
      return;
    }
    const formData: FormData = new FormData();
    const payload: EnseignantCreateRequest = {
      id: this.enseignantFormGroup.get("id")!.value,
      firstName: this.enseignantFormGroup.get("firstName")!.value,
      lastName: this.enseignantFormGroup.get("lastName")!.value,
      address: this.enseignantFormGroup.get("address")!.value,
      email: this.enseignantFormGroup.get("email")!.value,
      mobile: this.enseignantFormGroup.get("mobile")!.value,
      situationMatrimoniale: this.enseignantFormGroup.get("situationMatrimoniale")!.value,
      cni: this.enseignantFormGroup.get("cni")!.value,
      niveauEducation: this.enseignantFormGroup.get("niveauEducation")!.value,
      dateDebut: this.enseignantFormGroup.get("dateDebut")!.value,
      dateFin: this.enseignantFormGroup.get("dateFin")!.value,
    }
    if (this.enseignantId === null || this.enseignantId === undefined) {
      formData.append('file', this.currentFile!);
      formData.append('piecejointeenseignant', JSON.stringify(payload));
      console.log('payload sended {} ', payload);
      console.log('payload sended strigify {} ', JSON.stringify(payload));
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
*/


}
