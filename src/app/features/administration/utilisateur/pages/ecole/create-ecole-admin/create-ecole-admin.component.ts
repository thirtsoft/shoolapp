import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddEditEcoleAdmin } from '../../../../../../core/models/admin/ecole/ecole-admin';
import { UtilisateurResourceService } from '../../../service/utilisateur-resource.service';
import { UtilisateurService } from '../../../service/utilisateur.service';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from '../../../../../../core/services/local-storage.service';

@Component({
  selector: 'app-create-ecole-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-ecole-admin.component.html',
  styleUrls: ['./create-ecole-admin.component.css']
})
export class CreateEcoleAdminComponent implements OnInit {

  ecoleAdminFormGroup!: FormGroup;
  errorMessage?: string;
  ecoleAdmin?: AddEditEcoleAdmin = {};
  userId?: number;
  civilites?: string[] = ["M.", "Me"];


  today = new Date();

  title = "Création d'un compte d'un agent";

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly ecoleService = inject(UtilisateurResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly localStorage = inject(LocalStorageService);

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.initializeForm(null);
    if (this.userId && this.userId != null) {
      // this.getUtilisateurById(this.userId);
      this.title = "Modification d'un compte d'un agent";
    }
  }

  initializeForm(ecoleAdmin: AddEditEcoleAdmin | null) {
    this.ecoleAdminFormGroup = this._formBuilder.group({
      id: [ecoleAdmin?.id ? ecoleAdmin.id : ''],
      code: [ecoleAdmin?.code ? ecoleAdmin.code : '', Validators.required],
      nom: [ecoleAdmin?.nom ? ecoleAdmin.nom : '', Validators.required],
      subdomain: [ecoleAdmin?.subdomain ? ecoleAdmin.subdomain : '', Validators.required],
      schemaName: [ecoleAdmin?.schemaName ? ecoleAdmin.schemaName : ''],
      email: [ecoleAdmin?.email ? ecoleAdmin.email : '', Validators.required],
      telephone: [ecoleAdmin?.telephone ? ecoleAdmin.telephone : '', Validators.required],
      civility: [ecoleAdmin?.civility ? ecoleAdmin.civility : ''],
      prenomUtilisateur: [ecoleAdmin?.prenomUtilisateur ? ecoleAdmin.prenomUtilisateur : '', Validators.required],
      nomUtilisateur: [ecoleAdmin?.nomUtilisateur ? ecoleAdmin.nomUtilisateur : '', Validators.required],
      username: [ecoleAdmin?.username ? ecoleAdmin.username : '', Validators.required],
      emailUtilisateur: [ecoleAdmin?.emailUtilisateur ? ecoleAdmin.emailUtilisateur : '', Validators.required],
      telephoneUtilisateur: [ecoleAdmin?.telephoneUtilisateur ? ecoleAdmin.telephoneUtilisateur : '', Validators.required],
    });

  }


  ajouterOrEditEcoleAdmin() {
    if (!this.ecoleAdminFormGroup.valid) {
      return;
    }
    const payload: AddEditEcoleAdmin = {
      id: this.ecoleAdminFormGroup.get("id")!.value,
      nom: this.ecoleAdminFormGroup.get("nom")!.value,
      code: this.ecoleAdminFormGroup.get("code")!.value,
      subdomain: this.ecoleAdminFormGroup.get("subdomain")!.value,
      schemaName: this.ecoleAdminFormGroup.get("schemaName")!.value,
      telephone: this.ecoleAdminFormGroup.get("telephone")!.value,
      email: this.ecoleAdminFormGroup.get("email")!.value,

      civility: this.ecoleAdminFormGroup.get("civility")!.value,
      emailUtilisateur: this.ecoleAdminFormGroup.get("emailUtilisateur")!.value,
      prenomUtilisateur: this.ecoleAdminFormGroup.get("prenomUtilisateur")!.value,
      nomUtilisateur: this.ecoleAdminFormGroup.get("nomUtilisateur")!.value,
      telephoneUtilisateur: this.ecoleAdminFormGroup.get("telephoneUtilisateur")!.value,
      username: this.ecoleAdminFormGroup.get("username")!.value,

    }
    console.log('send payload', payload);

    this.utilisateurService.createOrEditEcoleAdmin(payload).subscribe({
      next: (data) => {
        console.log('payload after : ', data);
        if (data.statut === 'OK') {
          this.toastService.success('success', 'Le compte de l\'agent a été crée avec succès.');
          this.router.navigate(['/admin/utilisateur/ecole']);
        } else if (data.statut === 'FAILED') {
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
      }
    });

  }

  goBack() {
    this.router.navigate(['/admin/utilisateur/ecole']);
  }

}
