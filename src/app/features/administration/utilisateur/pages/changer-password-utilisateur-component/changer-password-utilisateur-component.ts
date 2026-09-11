import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationV2Service } from '../../../../auth/services/multitenantV2/authentication-v2.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-changer-password-utilisateur-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './changer-password-utilisateur-component.html',
  styleUrl: './changer-password-utilisateur-component.css',
})
export class ChangerPasswordUtilisateurComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthenticationV2Service);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);

  loading = signal(false);
  success = signal(false);
  error = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  changePasswordForm: FormGroup = this.formBuilder.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      this.passwordStrengthValidator
    ]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordsMatchValidator
  });

  get currentPassword() {
    return this.changePasswordForm.get('currentPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    return !isValid ? { weakPassword: true } : null;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

  getPasswordCriteria(value: string): { met: boolean; label: string }[] {
    return [
      { met: value.length >= 8, label: 'Au moins 8 caractères' },
      { met: /[A-Z]/.test(value), label: 'Au moins une majuscule' },
      { met: /[a-z]/.test(value), label: 'Au moins une minuscule' },
      { met: /[0-9]/.test(value), label: 'Au moins un chiffre' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(value), label: 'Au moins un caractère spécial' },
    ];
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.success.set(false);
    const userData = localStorage.getItem('v2_user');
    if (!userData) {
      this.error.set('Utilisateur non connecté');
      this.loading.set(false);
      return;
    }

    const user = JSON.parse(userData);
    const userUuid = user.uuid || user.id || user.uid;

    if (!userUuid) {
      this.error.set('Identifiant utilisateur non trouvé');
      this.loading.set(false);
      return;
    }

    const request = {
      currentPassword: this.currentPassword!.value,
      newPassword: this.newPassword!.value,
      confirmPassword: this.confirmPassword!.value
    };

    console.log('✅ send userUuid', userUuid);
    console.log('✅ send request', request);

    this.authService.changePassword(userUuid, request).subscribe({
      next: () => {
        console.log('✅ Mot de passe changé avec succès');
        this.toastService.success('success', 'Votre Mot de passe a été modifié succès avec succès.');
        this.loading.set(false);
        this.success.set(true);
        this.changePasswordForm.reset();

        setTimeout(() => {
          this.success.set(false);
          this.router.navigate(['/auth/login/v2']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur changement de mot de passe:', error);
        this.loading.set(false);
        this.success.set(false);

        if (error?.status === 400) {
          this.error.set('Le mot de passe actuel est incorrect');
        } else if (error?.status === 401) {
          this.error.set('Session expirée. Veuillez vous reconnecter');
        } else if (error?.status === 409) {
          this.error.set('Le nouveau mot de passe doit être différent de l\'ancien');
        } else {
          this.error.set('Une erreur est survenue. Veuillez réessayer.');
        }
        this.currentPassword?.reset();
      }
    });
  }

  toggleVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update(v => !v);
        break;
      case 'new':
        this.showNewPassword.update(v => !v);
        break;
      case 'confirm':
        this.showConfirmPassword.update(v => !v);
        break;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
