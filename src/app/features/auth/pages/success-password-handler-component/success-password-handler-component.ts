import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-success-password-handler-component',
  standalone: true,
  imports: [],
  templateUrl: './success-password-handler-component.html',
  styleUrl: './success-password-handler-component.css',
})
export class SuccessPasswordHandlerComponent implements OnInit {

  temporaryPassword: string = '';
  showPassword: boolean = false;
  copied: boolean = false;

  features = [
    { ico: '🔐', txt: 'Mot de passe sécurisé généré' },
    { ico: '📧', txt: 'Identifiant conservé' },
    { ico: '🔄', txt: 'Modification recommandée' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.temporaryPassword = params['temporalPassword'];
      if (!this.temporaryPassword) {
        this.router.navigate(['/']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.temporaryPassword).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    }).catch(err => {
      console.error('Erreur lors de la copie: ', err);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  regeneratePassword(): void {
    this.router.navigate(['/auth/mot-de-passe-oublie']);
  }


}
