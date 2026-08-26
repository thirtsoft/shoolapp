import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CategoryMenu } from '../../../../../../core/models/referentiels/category-menu';
import { MenuAddEdit } from '../../../../../../core/models/referentiels/menu';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielService } from '../../../service/referentiel.service';

@Component({
  selector: 'app-creation-menu-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './creation-menu-component.html',
  styleUrl: './creation-menu-component.css',
})
export class CreationMenuComponent implements OnInit {

  errorMessage?: string;
  menuFormGroup!: FormGroup;
  menu?: any;
  menuId?: number;
  categoryMenuList: CategoryMenu[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Gestion menu";

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.menuId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getCategoryMenuList();
    this.initializeForm(null);
    if (this.menuId != null && this.menuId != undefined) {
      this.getMenuById(this.menuId);
      this.title = 'Modifier menu';
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

  getCategoryMenuList() {
    this.referentielService.getAllCategoryMenus().subscribe(
      (data: any[]) => {
        this.categoryMenuList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getSelectedCategoryMenuName(): string {
    const catMenuId = this.menuFormGroup.get('categoryMenuId')?.value;
    const catMenu = this.categoryMenuList.find(b => Number(b.id) === Number(catMenuId));
    return catMenu?.libelle || '';
  }

  getMenuById(menuId: number) {
    this.referentielService.getMenuById(menuId).subscribe({
      next: (data) => {
        this.menu = data;
        this.initializeForm(this.menu);
      }
    });
  }

  initializeForm(menu: MenuAddEdit | null) {
    this.menuFormGroup = this._formBuilder.group({
      id: [menu?.id ? menu.id : ''],
      libelle: [menu?.libelle ? menu.libelle : '', Validators.required],
      description: [menu?.description ? menu.description : ''],
      categoryMenuId: [menu?.categoryMenuId ? menu.categoryMenuId : '', Validators.required],
    });
  }

  ajouterEditMenu() {
    const payload: MenuAddEdit = {
      id: this.menuFormGroup.get("id")!.value,
      libelle: this.menuFormGroup.get("libelle")!.value,
      description: this.menuFormGroup.get("description")!.value,
      categoryMenuId: this.menuFormGroup.get("categoryMenuId")!.value,
    }

    if (this.menuId === null || this.menuId === undefined) {
      this.referentielService.createMenu(payload).subscribe({
        next: (data) => {
          console.log('payload after : ', data);
          this.toastService.success('success', 'Le menu a été ajoutée avec succès.');
          this.goBack();
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.referentielService.updateMenu(this.menuId, payload).subscribe({
        next: data => {
          this.toastService.success('success', 'Le menu a été modifié avec succès.');
          this.goBack();

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }

  goBack() {
    this.router.navigate(['/admin/referentiel/menus']);
  }

}

