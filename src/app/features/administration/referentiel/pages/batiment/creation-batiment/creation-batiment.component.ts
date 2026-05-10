import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { Batiment } from '../../../../../../core/models/referentiels/batiment';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';


@Component({
  selector: 'app-creation-batiment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './creation-batiment.component.html',
  styleUrls: ['./creation-batiment.component.css']
})
export class CreationBatimentComponent implements OnInit {
  errorMessage?: string;
  batimentId: number;
  batimentFormGroup!: FormGroup;
  editBatiment: Batiment = {};
  typeSalles?: string[] = ["Ordinaire", "Spécialisée", "Extérieure"];

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Création d'un batiment ";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.batimentId = this.route.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.batimentId != null && this.batimentId != undefined) {
      this.getBatimentById(this.batimentId);
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

  getBatimentById(batId: number) {
    this.referentielService.getBatimentById(batId).subscribe({
      next: (data) => {
        this.editBatiment = data;
        this.batimentFormGroup = this._formBuilder.group({
          id: [this.editBatiment?.id ? this.editBatiment.id : ''],
          libelle: [this.editBatiment?.libelle ? this.editBatiment.libelle : '', Validators.required],
          ecole: [this.editBatiment?.ecole ? this.editBatiment.ecole : '', Validators.required],
          salleDTOList: this._formBuilder.array([])
        });
        for (let i = 0; i < this.editBatiment.salleDTOList!.length; i++) {
          (this.batimentFormGroup.get('salleDTOList') as FormArray).push(
            this._formBuilder.group({
              id: [this.editBatiment.salleDTOList![i].id],
              libelle: [this.editBatiment.salleDTOList![i].libelle, Validators.required],
              type_salle: [this.editBatiment.salleDTOList![i].type_salle, Validators.required],
              capacite: [this.editBatiment.salleDTOList![i].capacite, Validators.required],
              eocle: [this.editBatiment.ecole],
            })
          )
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  initializeForm(batiment: Batiment | null) {
    this.batimentFormGroup = this._formBuilder.group({
      id: [batiment?.id ? batiment.id : ''],
      libelle: [batiment?.libelle ? batiment.libelle : '', Validators.required],
      salleDTOList: this._formBuilder.array([
        this.newSalleItem()
      ])
    });
  }

  salleDTOList(): FormArray {
    return this.batimentFormGroup.get('salleDTOList') as FormArray;
  }

  newSalleItem(): FormGroup {
    return this._formBuilder.group({
      libelle: ['', Validators.required],
      type_salle: ['', Validators.required],
      capacite: ['', Validators.required],
      eocle: [this.ecoleId],
    })
  }

  onAddSalleItem() {
    this.salleDTOList().push(this.newSalleItem());
  }

  removeSalleItem(classItemIndex: number) {
    this.salleDTOList().removeAt(classItemIndex);
  }


  ajouterBatiment() {
    if (!this.batimentId && this.batimentId == undefined) {
      const payload: Batiment = {
        id: this.batimentFormGroup.get("id")!.value,
        libelle: this.batimentFormGroup.get("libelle")!.value,
        salleDTOList: this.batimentFormGroup.get("salleDTOList")!.value,
      }
      payload.ecole = this.ecoleId;
      this.referentielService.createBatiment(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations du batiment ont été enregistrées avec succès !!! ');
            this.router.navigate(['/admin/referentiels/batiment']);
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
      this.editBatiment = this.batimentFormGroup.value;
      this.referentielService.updateBatiment(this.batimentId, this.editBatiment).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations du batiment ont été modifiées avec succès !!! ');
            this.router.navigate(['/admin/referentiels/batiment']);
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

}
