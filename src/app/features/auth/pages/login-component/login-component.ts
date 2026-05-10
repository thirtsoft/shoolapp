import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {

  errorEmail = 'L\'adresse e-mail est obligatoire';
  errorPassword = 'Le mot de passe est obligatoire';

  signInForm: FormGroup;
  hidePassword: boolean = true;

  @Input() urlNavigation = '';

  isClicked: boolean = false;
  loading = false;
  succes = false;
  erreur = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly localStorage: LocalStorageService,
    private readonly utilsUser: UtilsService,
    private readonly router: Router
  ) {
    this.signInForm = this.formBuilder.group({
  //    username: ['', [Validators.required, Validators.email]],
  //    password: ['', [Validators.required, Validators.minLength(6)]],

      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }

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

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToForgotPassword() {
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

  onSubmit() {
    if (this.isClicked || this.loading) {
      return;
    }
    /*
    if (!this.signInForm.valid) {
      if (this.username?.hasError('required')) {
        this.erreur = 'Veuillez saisir votre adresse e-mail.';
      } else if (this.username?.hasError('email')) {
        this.erreur = 'Veuillez saisir une adresse e-mail valide.';
      } else if (this.password?.hasError('required')) {
        this.erreur = 'Veuillez saisir votre mot de passe.';
      } else if (this.password?.hasError('minlength')) {
        this.erreur = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else {
        this.erreur = 'Veuillez remplir tous les champs obligatoires.';
      }
      return;
    }*/

    this.erreur = '';
    this.isClicked = true;
    this.loading = true;

    const signInRequest = {
      username: this.username!.value.trim().toLowerCase(),
      password: this.password!.value
    };

    console.log("Tentative de connexion...");

    this.authService.signIn(signInRequest).subscribe({
      next: (response) => {
        console.log("Connexion réussie");
        this.succes = true;
        this.loading = false;

        setTimeout(() => {
          this.utilsUser.afterLoginSuccessful(response, this.urlNavigation);
        }, 1000);
      },
      error: (error) => {
        console.error("Erreur de connexion");
        this.isClicked = false;
        this.loading = false;
        this.succes = false;

        this.erreur = 'Identifiants invalides. Veuillez réessayer.';

        this.signInForm.patchValue({ password: '' });
      }
    });
  }
}