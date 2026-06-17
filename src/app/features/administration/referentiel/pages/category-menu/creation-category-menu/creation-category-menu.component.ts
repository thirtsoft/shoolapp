import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoryMenu } from '../../../../../../core/models/referentiels/category-menu';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-creation-category-menu',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './creation-category-menu.component.html',
  styleUrls: ['./creation-category-menu.component.css']
})
export class CreationCategoryMenuComponent implements OnInit {
  errorMessage?: string;
  categoryMenuId: number;
  categoryMenuFormGroup!: FormGroup;
  editCategoryMenu: CategoryMenu = {};
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Création d'un menu ";

  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.categoryMenuId = this.route.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.initializeForm(null);
    if (this.categoryMenuId != null && this.categoryMenuId != undefined) {
      this.getCategoryMenuById(this.categoryMenuId);
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

  getCategoryMenuById(batId: number) {
    this.referentielService.getCategoryMenuById(batId).subscribe({
      next: (data) => {
        this.editCategoryMenu = data;
        console.log(this.editCategoryMenu);
        this.categoryMenuFormGroup = this._formBuilder.group({
          id: [this.editCategoryMenu?.id ? this.editCategoryMenu.id : ''],
          libelle: [this.editCategoryMenu?.libelle ? this.editCategoryMenu.libelle : '', Validators.required],
          menuDTOs: this._formBuilder.array([])
        });
        for (let i = 0; i < this.editCategoryMenu.menuDTOs!.length; i++) {
          (this.categoryMenuFormGroup.get('menuDTOs') as FormArray).push(
            this._formBuilder.group({
              id: [this.editCategoryMenu.menuDTOs![i].id],
              libelle: [this.editCategoryMenu.menuDTOs![i].libelle, Validators.required],
              description: [this.editCategoryMenu.menuDTOs![i].description, Validators.required],
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

  initializeForm(catMenu: CategoryMenu | null) {
    this.categoryMenuFormGroup = this._formBuilder.group({
      id: [catMenu?.id ? catMenu.id : ''],
      libelle: [catMenu?.libelle ? catMenu.libelle : '', Validators.required],
      menuDTOs: this._formBuilder.array([
        this.newMenuItem()
      ])
    });
  }

  menuDTOs(): FormArray {
    return this.categoryMenuFormGroup.get('menuDTOs') as FormArray;
  }

  newMenuItem(): FormGroup {
    return this._formBuilder.group({
      libelle: ['', Validators.required],
      description: ['']
    })
  }

  onAddMenuItem() {
    console.log("New traitement", this.newMenuItem().value);
    this.menuDTOs().push(this.newMenuItem());
  }

  removeMenuItem(menuItemIndex: number) {
    this.menuDTOs().removeAt(menuItemIndex);
  }


  ajouterCategoryMenu() {
    if (!this.categoryMenuId && this.categoryMenuId == undefined) {
      const payload: CategoryMenu = {
        id: this.categoryMenuFormGroup.get("id")!.value,
        libelle: this.categoryMenuFormGroup.get("libelle")!.value,
        menuDTOs: this.categoryMenuFormGroup.get("menuDTOs")!.value,
      }
      payload.ecole = this.ecoleId;
      this.referentielService.createCategoryMenu(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le menu a été enregistrées avec succès !!! ');
            this.router.navigate(['/admin/referentiel/category-menu']);
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
      this.editCategoryMenu = this.categoryMenuFormGroup.value;
      this.editCategoryMenu.ecole = this.editCategoryMenu.ecole;
      this.referentielService.updateCategoryMenu(this.categoryMenuId, this.editCategoryMenu).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le menu a été modifiés avec succès !!! ');
            this.router.navigate(['/admin/referentiel/category-menu']);
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la modification : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }
  }
}
