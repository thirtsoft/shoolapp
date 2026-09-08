import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-password-handler-component',
  standalone: true,
  imports: [],
  templateUrl: './success-password-handler-component.html',
  styleUrl: './success-password-handler-component.css',
})
export class SuccessPasswordHandlerComponent implements OnInit {

  temporaryPassword: string = '';
  emailSent: boolean = false;

  showPassword: boolean = false;
  copied: boolean = false;

  features = [
    { ico: '🔐', txt: 'Mot de passe sécurisé généré' },
    { ico: '📧', txt: 'Identifiant conservé' },
    { ico: '🔄', txt: 'Modification recommandée' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state) {
      this.temporaryPassword = state['temporaryPassword'] ?? '';
      this.emailSent = state['emailSent'] ?? false;
    }
    if (!this.temporaryPassword) {
      const historyState = window.history.state;

      this.temporaryPassword = historyState?.temporaryPassword ?? '';

      this.emailSent = historyState?.emailSent ?? false;
    }

    if (!this.temporaryPassword) {
      this.router.navigate(['/auth/mot-de-passe-oublie']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  copyToClipboard(): void {
    if (!this.temporaryPassword) {
      return;
    }

    navigator.clipboard.writeText(this.temporaryPassword).then(
      () => {
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 3000);

      })
      .catch((error) => {
        console.error(
          'Erreur lors de la copie : ',
          error
        );
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login/v2']);
  }

  regeneratePassword(): void {
    this.router.navigate(['/auth/mot-de-passe-oublie']);
  }
}