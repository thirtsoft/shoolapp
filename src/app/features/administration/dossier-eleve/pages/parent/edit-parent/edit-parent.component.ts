import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parent } from '../../../../../../core/models/parent/parent';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';


@Component({
  selector: 'app-edit-parent',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-parent.component.html',
  styleUrls: ['./edit-parent.component.css']
})
export class EditParentComponent implements OnInit {

  errorMessage?: string;
  parentFormGroup!: FormGroup;
  parent?: any;
  parentId?: number;
  civilites?: string[] = ["M.", "Me"];
  userId?: any;

  title = "Ajouter un parent";

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activeRoute = inject(ActivatedRoute);


  ngOnInit(): void {
    this.parentId = this.activeRoute.snapshot.params['id'];
    if (this.parentId != null && this.parentId != undefined) {
      this.getParentById(this.parentId);
      this.title = 'Modifier un parent';
    }
  }

  initializeForm(parent: Parent | null) {
    this.parentFormGroup = this._formBuilder.group({
      id: [parent?.id ? parent.id : ''],
      civility: [parent?.civility ? parent.civility : ''],
      nom: [parent?.nom ? parent.nom : '', Validators.required],
      prenom: [parent?.prenom ? parent.prenom : '', Validators.required],
      address: [parent?.address ? parent.address : ''],
      email: [parent?.email ? parent.email : '', Validators.required],
      telephone: [parent?.telephone ? parent.telephone : '', Validators.required],
      username: [parent?.username ? parent.username : '', Validators.required],
      profession: [parent?.profession ? parent.profession : ''],
    });
  }

  getParentById(parentId: number) {
    this.utilisateurService.getUtilisateur(parentId).subscribe({
      next: (data) => {
        this.parent = data;
        this.userId = this.parent.userId;
        console.log('Parent {} ', this.parent);
        this.initializeForm(this.parent);
      }
    });
  }

  ajoutereditParent() {
    const payload: Parent = {
      id: this.parentFormGroup.get("id")!.value,
      civility: this.parentFormGroup.get("civility")!.value,
      nom: this.parentFormGroup.get("nom")!.value,
      prenom: this.parentFormGroup.get("prenom")!.value,
      address: this.parentFormGroup.get("address")!.value,
      email: this.parentFormGroup.get("email")!.value,
      telephone: this.parentFormGroup.get("telephone")!.value,
      username: this.parentFormGroup.get("username")!.value,
      profession: this.parentFormGroup.get("profession")!.value,
    }
    payload.userId = this.userId;
    this.utilisateurService.updateParent(this.parentId!, payload).subscribe({
      next: data => {
        if (data.statut === 'OK') {
          this.toastService.success('success', 'Le compte du parent a été modifié avec succès.');
          this.router.navigate(['/admin/dossier-eleve/parent']);
        } else if (data.statut === 'FAILED') {
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
      }
    });
  }

}
