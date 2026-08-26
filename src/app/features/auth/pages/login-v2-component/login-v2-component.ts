import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationV2Service } from '../../services/multitenantV2/authentication-v2.service';
import { SessionV2Service } from '../../services/multitenantV2/session-v2.service';
import { SetupApiService } from '../../../setup/services/setup-api-service';
import { AccessV2Service } from '../../services/multitenantV2/access-v2.service';

@Component({
  selector: 'app-login-v2-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-v2-component.html',
  styleUrl: './login-v2-component.css',
})
export class LoginV2Component {

  errorEmail = 'L\'adresse e-mail est obligatoire';
  errorPassword = 'Le mot de passe est obligatoire';

  hidePassword: boolean = true;

  @Input() urlNavigation = '';

  isClicked: boolean = false;
  loading = false;
  succes = false;
  erreur = '';

  private readonly formBuilder = inject(FormBuilder);
  private readonly authenticationV2Service = inject(AuthenticationV2Service);
  private readonly sessionV2Service = inject(SessionV2Service);
  private readonly setupService = inject(SetupApiService);
  private readonly accessV2Service = inject(AccessV2Service);
  private readonly router = inject(Router);


  signInForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  // Données conservées pour le design du panneau gauche
  stats = [
    { val: '1 200', lbl: 'Élèves' },
    { val: '85', lbl: 'Professeurs' },
    { val: '24/7', lbl: 'Disponible' },
    { val: '🇸🇳', lbl: 'Dakar' },
  ];

  features = [
    { ico: '📚', txt: 'Gestion des classes et emplois du temps' },
    { ico: '📝', txt: 'Saisie des notes et bulletins' },
    { ico: '📱', txt: 'Suivi en temps réel pour les parents' },
  ];

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToForgotPassword(): void {
    this.router.navigate(['auth/mot-de-passe-oublie']);
  }

  get username() {
    return this.signInForm.get('username');
  }

  get password() {
    return this.signInForm.get('password');
  }

  get passwordType(): string {
    return this.hidePassword ? 'password' : 'text';
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

    const signInRequest = {
      username: this.username!.value.trim().toLowerCase(),
      password: this.password!.value
    };

    console.log('Tentative de connexion V2...');

    this.authenticationV2Service.signIn(signInRequest).subscribe({

      next: (response) => {

        console.log('Connexion V2 réussie');

        this.sessionV2Service.saveSession(response);

        const organization = this.sessionV2Service.getCurrentOrganization();

        if (!organization) {
          this.handleLoginError('Aucune organisation courante n\'est disponible.');
          return;
        }

        const roles = organization.roles ?? [];

        /*
         * ADMIN_SCHOOL :
         * le statut du Setup doit être récupéré avant
         * de déterminer la route finale.
         */
        if (roles.includes('ADMIN_SCHOOL')) {

          this.setupService.getCurrent().subscribe({

            next: (setup) => {

              const route =
                this.accessV2Service.determineInitialRoute(setup.status);

              this.navigateAfterLogin(route);
            },

            error: (error) => {

              if (error?.status === 404) {

                const route = this.accessV2Service.determineInitialRoute();

                this.navigateAfterLogin(route);

                return;
              }

              this.handleLoginError(
                'Impossible de récupérer l\'état de la configuration.'
              );
            }
          });

          return;
        }

        const route = this.accessV2Service.determineInitialRoute();

        this.navigateAfterLogin(route);
      },

      error: (error) => {

        console.error('Erreur de connexion V2', error);

        this.handleLoginError('Identifiants invalides. Veuillez réessayer.');

        this.signInForm.patchValue({ password: '' });
      }
    });
  }

  private navigateAfterLogin(route: string): void {
    this.succes = true;
    this.loading = false;
    setTimeout(() => { this.router.navigateByUrl(route); }, 1000);

  }

  private handleLoginError(message: string): void {
    this.isClicked = false;
    this.loading = false;
    this.succes = false;
    this.erreur = message;
  }


}