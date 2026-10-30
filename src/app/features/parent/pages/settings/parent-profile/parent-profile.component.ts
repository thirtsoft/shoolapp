import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserApiService } from '../../../../administration/utilisateur/service/user-api.service';
import { AuthenticationV2Service } from '../../../../auth/services/multitenantV2/authentication-v2.service';


interface UserProfile {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  recordStatus: string;
  enabled: boolean;
  accountLocked: boolean;
}

interface SecurityCredentialResponse {
  securityCredentialId: number;
  securityCredentialUuid: string;
  userUuid: string;
  credentialType: string;
  identifier: string;
  enabled: boolean;
  locked: boolean;
  mustChangePassword: boolean;
  expiresAt: string | null;
}

interface UserInfoUpdateRequest {
  email?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
}

interface ChangeIdentifierRequest {
  identifier: string;
}


@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './parent-profile.component.html',
  styleUrls: ['./parent-profile.component.css']
})
export class ParentProfileComponent implements OnInit {


  user: UserProfile | null = null;

  securityCredential: SecurityCredentialResponse | null = null;

  editedUser: Partial<UserProfile> = {};

  editedIdentifier = '';

  editingIdentity = false;
  editingConnection = false;

  savingIdentity = false;
  savingConnection = false;

  loadingConnection = false;

  private readonly authService = inject(AuthenticationV2Service);
  private readonly userService = inject(UserApiService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);


  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const userData = localStorage.getItem('v2_user');
    if (!userData) {
      console.warn('Aucune information utilisateur trouvée.');
      return;
    }
    try {

      this.user = JSON.parse(userData) as UserProfile;

      this.loadConnectionInfo();

    } catch (error) {
      console.error(
        'Impossible de parser les informations utilisateur',
        error
      );

    }
  }

  private loadConnectionInfo(): void {
    if (!this.user?.uuid) {
      return;
    }

    this.loadingConnection = true;

    this.authService.getInfoConnexion(this.user.uuid).subscribe({
      next: (response: any) => {

        this.securityCredential = response;

        this.editedIdentifier = response.identifier ?? '';

        this.loadingConnection = false;
      },

      error: (error) => {
        console.error(
          'Impossible de récupérer les informations de connexion',
          error
        );

        this.loadingConnection = false;

        this.toastService.error('Impossible de récupérer les informations de connexion.');
      }
    });
  }


  get userInitial(): string {
    if (!this.user) {
      return 'U';
    }

    const firstNameInitial = this.user.firstName?.trim().charAt(0);
    const lastNameInitial = this.user.lastName?.trim().charAt(0);

    if (firstNameInitial && lastNameInitial) {
      return (firstNameInitial + lastNameInitial).toUpperCase();
    }

    return (firstNameInitial || lastNameInitial || 'U').toUpperCase();
  }

  commencerModificationIdentite(): void {
    if (!this.user) {
      return;
    }
    this.editedUser = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      mobile: this.user.mobile
    };
    this.editingIdentity = true;
  }

  annulerModificationIdentite(): void {
    this.editingIdentity = false;
    this.editedUser = {};
  }


  enregistrerIdentite(): void {

    if (!this.user || this.savingIdentity) {
      return;
    }

    const firstName = this.editedUser.firstName?.trim();
    const lastName = this.editedUser.lastName?.trim();

    if (!firstName) {
      this.toastService.warning('Le prénom est obligatoire.');
      return;
    }

    if (!lastName) {
      this.toastService.warning('Le nom est obligatoire.');
      return;
    }

    const request: UserInfoUpdateRequest = {
      firstName,
      lastName,
      email: this.editedUser.email?.trim() ?? '',
      mobile: this.editedUser.mobile?.trim() ?? ''
    };

    this.savingIdentity = true;

    this.userService.updateUserInfo(this.user.uuid, request).subscribe({
      next: (response: any) => {

        this.user = response;

        localStorage.setItem('v2_user', JSON.stringify(response));

        this.editingIdentity = false;
        this.editedUser = {};
        this.savingIdentity = false;

        this.toastService.success('Vos informations ont été mises à jour.');
      },

      error: (error) => {
        console.error(
          'Erreur lors de la mise à jour du profil',
          error
        );

        this.savingIdentity = false;

        this.toastService.error('Impossible de mettre à jour vos informations.');
      }
    });
  }

  commencerModificationConnexion(): void {
    if (!this.securityCredential) {
      return;
    }

    this.editedIdentifier = this.securityCredential.identifier ?? '';
    this.editingConnection = true;
  }


  annulerModificationConnexion(): void {
    this.editingConnection = false;
    this.editedIdentifier = this.securityCredential?.identifier ?? '';
  }


  enregistrerIdentifiantConnexion(): void {
    if (!this.user || !this.securityCredential || this.savingConnection) {
      return;
    }

    const identifier = this.editedIdentifier.trim();
    if (!identifier) {
      this.toastService.warning('L’identifiant de connexion est obligatoire.');
      return;
    }

    const request: ChangeIdentifierRequest = {
      identifier
    };

    this.savingConnection = true;

    this.authService.changeIdentifiant(this.user.uuid, request)
      .subscribe({
        next: (response: any) => {

          this.securityCredential = response;

          this.editedIdentifier = response.identifier ?? '';
          this.editingConnection = false;
          this.savingConnection = false;

          this.toastService.success('Votre identifiant de connexion a été mis à jour.');
        },

        error: (error) => {
          console.error(
            'Erreur lors de la modification de l’identifiant',
            error
          );

          this.savingConnection = false;

          this.toastService.error('Impossible de modifier l’identifiant de connexion.');
        }
      });
  }


  get isAccountActive(): boolean {
    return !!(
      this.user &&
      this.user.enabled &&
      this.user.recordStatus === 'ACTIVE' &&
      !this.user.accountLocked
    );
  }


  get isConnectionActive(): boolean {
    return !!(
      this.securityCredential &&
      this.securityCredential.enabled &&
      !this.securityCredential.locked
    );
  }


  modifierMotDePasse(): void {
    void this.router.navigate(['/parent/changer-mot-passe']);
  }

}