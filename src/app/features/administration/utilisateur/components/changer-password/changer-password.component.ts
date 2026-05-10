import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurCredentials } from '../../../../../core/models/utilisateur/utilisateur-credential';
import { UtilisateurService } from '../../service/utilisateur.service';

@Component({
  selector: 'app-changer-password',
  standalone: true,
  imports: [],
  templateUrl: './changer-password.component.html',
  styleUrls: ['./changer-password.component.css']
})
export class ChangerPasswordComponent implements OnInit {

  passwordUpdateFormGroup!: FormGroup;
  errorMessage?: string;
  utilisateur?: Utilisateur;

  title = "Modifier mon mot de passe";

  errorPassword = 'Le champs mot de passe est obligatoire et doit contenir au moins 7 caractères';

  errorPasswordRepeat = 'Les deux mots de passe ne sont pas identiques';

  hideCurrent = true;

  hideNew = true;

  hideConfirm = true;

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  //  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly activeModal = inject(NgbActiveModal);


  ngOnInit(): void {
    this.initUpdatePasswordFormgroup();
    this.getConnectedUserInfos();
  }


  initUpdatePasswordFormgroup() {
    this.passwordUpdateFormGroup = this._formBuilder.group({
      username: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
    },
      {
        validators: this.passwordMatchValidator
      });
  }

  about() {
    this.chanPassword = false;
  }

  chanPassword: boolean = false;

  pass() {
    this.chanPassword = true;
  }

  onSubmit() {
    const payload: UtilisateurCredentials = {
      username: this.username!.value,
      currentPassword: this.currentPassword!.value,
      newPassword: this.newPassword!.value,
    }
    console.log(payload);
    this.utilisateurService.updatePassword(this.utilisateur!.id!, payload).subscribe({
      next: data => {
        if (data.statut == 'OK') {
          this.toastService.success('success', 'Votre mot de passe a été mis à jour avec succès.');
          this.activeModal.close('success')
        }
        else {
          this.toastService.error('error', data.message);
        }
      },
      error: error => {
        this.toastService.error('error', 'Erreur lors de la modification de mot de passe : ' + error.message);
      },
    });
  }

  getConnectedUserInfos() {
    const userId = localStorage.getItem('id');
    this.utilisateurService.getUtilisateur(Number(userId)).subscribe({
      next: data => {
        this.utilisateur = data;
        console.log(this.utilisateur);
        this.passwordUpdateFormGroup.get('username')!.setValue(data.username);
      },
      error: error => { console.log(error) },
    });
  }

  get username() {
    return this.passwordUpdateFormGroup.get('username');
  }

  get currentPassword() {
    return this.passwordUpdateFormGroup.get('currentPassword');
  }

  get newPassword() {
    return this.passwordUpdateFormGroup.get('newPassword');
  }

  get confirmNewPassword() {
    return this.passwordUpdateFormGroup.get('confirmNewPassword');
  }

  passwordMatchValidator(group: FormGroup) {
    const password: string = group.get('newPassword')!.value;
    const confirmPassword: string = group.get('confirmNewPassword')!.value;
    if (password !== confirmPassword) {
      group.get('confirmNewPassword')!.setErrors({ NoPassswordMatch: true });
    }
  }
}
