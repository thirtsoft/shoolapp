import { Component, inject, OnInit } from '@angular/core';
import { UserCreateResponse } from '../../../../../core/models/utilisateur/user-creation-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-user-create-component',
  standalone: true,
  imports: [],
  templateUrl: './success-user-create-component.html',
  styleUrl: './success-user-create-component.css',
})
export class SuccessUserCreateComponent implements OnInit {


  creationResponse?: UserCreateResponse;

  copiedField?: 'login' | 'password' | 'all';

  private readonly router = inject(Router);

  ngOnInit(): void {

    const navigationState =
      this.router.getCurrentNavigation()?.extras?.state;

    this.creationResponse =
      navigationState?.['creationResponse']
      ?? history.state?.['creationResponse'];

    console.log(
      'Réponse de création utilisateur :',
      this.creationResponse
    );

    if (!this.creationResponse) {
      this.goToUsers();
    }
  }

  async copyCredentials(): Promise<void> {

    if (!this.creationResponse?.credentials) {
      return;
    }

    const {
      loginIdentifier,
      temporaryPassword
    } = this.creationResponse.credentials;

    const credentialsText =
      `Identifiant de connexion : ${loginIdentifier}
Mot de passe temporaire : ${temporaryPassword}`;

    try {

      await navigator.clipboard.writeText(credentialsText);

      this.copiedField = 'all';

      setTimeout(() => {
        this.copiedField = undefined;
      }, 2500);

    } catch (error) {

      console.error(
        'Impossible de copier les identifiants',
        error
      );
    }
  }

  async copyLoginIdentifier(): Promise<void> {

    const loginIdentifier =
      this.creationResponse?.credentials?.loginIdentifier;

    if (!loginIdentifier) {
      return;
    }

    await this.copyToClipboard(loginIdentifier);

    this.copiedField = 'login';

    setTimeout(() => {
      this.copiedField = undefined;
    }, 2000);
  }

  async copyTemporaryPassword(): Promise<void> {

    const temporaryPassword =
      this.creationResponse?.credentials?.temporaryPassword;

    if (!temporaryPassword) {
      return;
    }

    await this.copyToClipboard(temporaryPassword);

    this.copiedField = 'password';

    setTimeout(() => {
      this.copiedField = undefined;
    }, 2000);
  }

  private async copyToClipboard(value: string): Promise<void> {

    try {

      await navigator.clipboard.writeText(value);

    } catch (error) {

      console.error(
        'Impossible de copier dans le presse-papiers',
        error
      );
    }
  }

  goToUsers(): void {
    this.router.navigate(['/admin/utilisateur/list']);
  }

}