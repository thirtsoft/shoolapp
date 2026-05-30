import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Profil } from '../../../../../core/models/profil/profil';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { ProfilageService } from '../../../profil/service/profilage.service';
import { UtilisateurService } from '../../service/utilisateur.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-create-utilisateur',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-utilisateur.component.html',
  styleUrls: ['./create-utilisateur.component.css']
})
export class CreateUtilisateurComponent implements OnInit {

  utilisateurFormGroup!: FormGroup;
  errorMessage?: string;
  utilisateur?: Utilisateur;
  userId?: number;
  civilites?: string[] = ["M.", "Me"];

  profils: Profil[] = [];

  today = new Date();

  title = "Création d'un compte d'un agent";

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly profilageService = inject(ProfilageService);
  private readonly toastService = inject(ToastrService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.getProfils();
    this.initializeForm(null);
    if (this.userId && this.userId != null) {
      this.getUtilisateurById(this.userId);
      this.title = "Modification d'un compte d'un agent";
    }
  }

  getProfils() {
    this.profilageService.getProfilesAgents().subscribe(
      (data: any[]) => {
        this.profils = data;
        console.log(this.profils);
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getUtilisateurById(eleveId: number) {
    this.utilisateurService.getUtilisateur(eleveId).subscribe({
      next: (data) => {
        this.utilisateur = data;
        console.log(this.utilisateur);
        this.initializeForm(this.utilisateur);
        this.title = 'Modification d\'un utilisateur';
      }
    });
  }

  initializeForm(utilisateur: Utilisateur | null) {
    this.utilisateurFormGroup = this._formBuilder.group({
      id: [utilisateur?.id ? utilisateur.id : ''],
      civility: [utilisateur?.civility ? utilisateur.civility : ''],
      nom: [utilisateur?.nom ? utilisateur.nom : '', Validators.required],
      prenom: [utilisateur?.prenom ? utilisateur.prenom : '', Validators.required],
      address: [utilisateur?.address ? utilisateur.address : ''],
      email: [utilisateur?.email ? utilisateur.email : '', Validators.required],
      telephone: [utilisateur?.telephone ? utilisateur.telephone : '', Validators.required],
      username: [utilisateur?.username ? utilisateur.username : '', Validators.required],
      profession: [utilisateur?.profession ? utilisateur.profession : ''],
      profileId: [utilisateur?.profilDTO!.id ? utilisateur?.profilDTO.id : '', Validators.required],
    });
  }


  ajouterPersonnel() {
    const payload: Utilisateur = {
      id: this.utilisateurFormGroup.get("id")!.value,
      civility: this.utilisateurFormGroup.get("civility")!.value,
      nom: this.utilisateurFormGroup.get("nom")!.value,
      prenom: this.utilisateurFormGroup.get("prenom")!.value,
      address: this.utilisateurFormGroup.get("address")!.value,
      email: this.utilisateurFormGroup.get("email")!.value,
      telephone: this.utilisateurFormGroup.get("telephone")!.value,
      username: this.utilisateurFormGroup.get("username")!.value,
      profession: this.utilisateurFormGroup.get("profession")!.value,
      profilDTO: this.profils.filter(r => r.id == this.utilisateurFormGroup.get("profileId")!.value)[0]
    }
    if (this.userId === null || this.userId === undefined) {
      this.utilisateurService.createUtilisateur(payload).subscribe({
        next: (data) => {
          console.log('payload after : ', data);
          if (data.statut === 'OK') {
            this.toastService.success('success', 'Le compte de l\'agent a été crée avec succès.');
            this.router.navigate(['/admin/utilisateur/list']);
          } else if (data.statut === 'FAILED') {
            this.toastService.warning('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.utilisateurService.updateUtilisateur(this.userId, payload).subscribe({
        next: data => {
          if (data.statut === 'OK') {
            this.toastService.success('success', 'Le compte de l\'agent a été modifié avec succès.');
            this.router.navigate(['/admin/utilisateur/list']);
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

  goBack() {
    this.router.navigate(['/admin/utilisateur/list']);
  }

}
