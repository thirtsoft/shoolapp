import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationV2Service } from '../../services/multitenantV2/authentication-v2.service';

@Component({
  selector: 'app-forgot-password-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export class ForgotPasswordComponent {

  errorEmail = 'L\'identifiant de connexion est obligatoire';
  errorNotFound = 'Aucun compte trouvé avec cet identifiant';

  isClicked: boolean = false;
  loading: boolean = false;
  success: boolean = false;
  erreur: string = '';

  private readonly formBuilder = inject(FormBuilder);
  private readonly authenticationV2Service = inject(AuthenticationV2Service);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);

  features = [
    { ico: '✉️', txt: 'Saisissez votre identifiant de connexion' },
    { ico: '🔄', txt: 'Validation et envoi de la demande' },
    { ico: '🔑', txt: 'Réception d\'un nouveau mot de passe' },
  ];

  stats = [
    { ico: '🔐', val: 'Généré', lbl: 'Mot de passe' },
    { ico: '⏱️', val: '24h', lbl: 'Temporaire' },
    { ico: '📧', val: 'Envoyé', lbl: 'Par email' },
    { ico: '🛡️', val: 'Sécurisé', lbl: 'Chiffré' },
  ];

  signInForm: FormGroup = this.formBuilder.group({
    identifier: ['', [Validators.required]],
  });

  get identifier() {
    return this.signInForm.get('identifier');
  }

  onSubmit(): void {
    if (this.isClicked || this.loading) {
      return;
    }
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.erreur = '';
    this.isClicked = true;
    this.loading = true;
    this.success = false;

    const identifier = this.identifier!.value.trim().toLowerCase();

    const forgotPasswordRequest = {
      identifier
    };

    this.authenticationV2Service
      .forgotPassword(forgotPasswordRequest).subscribe({

        next: (response) => {
          this.loading = false;
          if (response?.success && response?.data?.temporaryPassword) {
            this.success = true;
            const temporaryPassword = response.data.temporaryPassword;

            const emailSent = response.data.emailSent;

            if (emailSent) {
              this.toastService.success(
                'Succès',
                'Le mot de passe temporaire a été envoyé par email.'
              );
            } else {
              this.toastService.warning('Attention',
                'Le mot de passe a été généré, mais l\'email n\'a pas pu être envoyé.'
              );
            }

            setTimeout(() => {
              this.router.navigate(
                ['/success-password'],
                {
                  state: { temporaryPassword, emailSent }
                }
              );
            }, 1500);

          } else {
            this.erreur = 'Aucun mot de passe temporaire reçu. Veuillez réessayer.';

            this.isClicked = false;
            this.success = false;
          }
        },

        error: (error) => {
          console.error(
            '❌ Erreur de récupération de mot de passe',
            error
          );

          if (error?.status === 404) {
            this.erreur = this.errorNotFound;

          } else if (error?.status === 400) {
            this.erreur = 'Format d\'identifiant invalide. Veuillez vérifier votre saisie.';

          } else if (error?.status === 429) {
            this.erreur = 'Trop de tentatives. Veuillez attendre quelques minutes.';

          } else {
            this.erreur = 'Une erreur est survenue. Veuillez réessayer.';
          }

          this.isClicked = false;
          this.loading = false;
          this.success = false;

          this.signInForm.patchValue({ identifier: '' });
        },

        complete: () => {
          this.isClicked = false;
          this.loading = false;
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login/v2']);
  }
}