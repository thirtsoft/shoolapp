import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RolesResponse } from '../../../../../core/models/role/roles-response.model';
import { UserCreationRequest } from '../../../../../core/models/utilisateur/user-creation-request.model';
import { UserResponse } from '../../../../../core/models/utilisateur/user-response.model';
import { RoleTenantService } from '../../../role-tenant/services/role-tenant-service';
import { UserApiService } from '../../service/user-api.service';


@Component({
  selector: 'app-create-utilisateur',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-utilisateur.component.html',
  styleUrls: ['./create-utilisateur.component.css']
})
export class CreateUtilisateurComponent implements OnInit {

  utilisateurFormGroup!: FormGroup;

  roles: RolesResponse[] = [];

  user?: UserResponse;

  userUuid?: string;

  errorMessage?: string;

  loading = false;

  loadingRoles = false;

  title = "Création d'un compte utilisateur";

  private readonly userApiService = inject(UserApiService);
  private readonly roleTenantService = inject(RoleTenantService);
  private readonly toastService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);


  ngOnInit(): void {

    this.userUuid = this.route.snapshot.params['userUuid'];

    this.initializeForm();

    this.loadRoles();

    if (this.userUuid) {

      this.title = "Modification d'un compte utilisateur";

      this.loadUser(this.userUuid);
    }
  }

  private initializeForm(): void {
    this.utilisateurFormGroup = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      mobile: ['', [Validators.required, Validators.maxLength(30)]],
      loginIdentifier: ['', [Validators.required, Validators.maxLength(150)]],
      roleUuid: ['', Validators.required],
      fonction: ['', Validators.maxLength(100)]
    });
  }

  private loadRoles(): void {

    this.loadingRoles = true;

    this.roleTenantService.getAssignableRoles().subscribe({

      next: (roles) => {

        this.roles = roles ?? [];

        this.loadingRoles = false;
      },

      error: (error) => {

        this.loadingRoles = false;

        console.error('Erreur lors du chargement des rôles', error);

        this.toastService.error('Impossible de charger les rôles disponibles.');
      }
    });
  }


  private loadUser(userUuid: string): void {

    this.loading = true;

    this.userApiService.getUser(userUuid).subscribe({

      next: (user) => {

        this.user = user;

        this.utilisateurFormGroup.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email ?? '',
          mobile: user.mobile ?? '',
          loginIdentifier: '',
          roleUuid: '',
          fonction: ''
        });
        this.loading = false;
      },

      error: (error) => {

        this.loading = false;

        console.error('Erreur lors du chargement de l’utilisateur', error);

        this.toastService.error('Impossible de charger l’utilisateur.');
      }
    });
  }


  ajouterPersonnel(): void {

    if (this.utilisateurFormGroup.invalid) {
      this.utilisateurFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.utilisateurFormGroup.getRawValue();

    const payload: UserCreationRequest = {

      firstName: formValue.firstName.trim(),

      lastName: formValue.lastName.trim(),

      email: formValue.email?.trim() || undefined,

      mobile: formValue.mobile.trim(),

      loginIdentifier: formValue.loginIdentifier.trim(),

      roleUuid: formValue.roleUuid,

      fonction: formValue.fonction?.trim() || undefined
    };

    this.loading = true;

    if (!this.userUuid) {

      this.createUser(payload);

    } else {

      this.updateUser(payload);
    }
  }


  private createUser(payload: UserCreationRequest): void {

    this.userApiService.createUser(payload).subscribe({

      next: (response) => {

        this.loading = false;

        console.log('Utilisateur créé', response);

        this.toastService.success('Le compte utilisateur a été créé avec succès.');

        this.router.navigate(
          ['/admin/utilisateur/success-creation'],
          {
            state: {
              creationResponse: response
            }
          }
        );
      },

      error: (error) => {

        this.loading = false;

        console.error('Erreur création utilisateur', error);

        const message = error?.error?.message ?? 'Erreur lors de la création du compte utilisateur.';

        this.toastService.error(message);
      }
    });
  }

  private updateUser(payload: UserCreationRequest): void {

    if (!this.userUuid) {
      return;
    }

    this.userApiService.updateUser(this.userUuid,
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        mobile: payload.mobile
      }
    ).subscribe({

      next: () => {

        this.loading = false;

        this.toastService.success('Le compte utilisateur a été modifié avec succès.');

        this.goBack();
      },

      error: (error) => {

        this.loading = false;

        console.error('Erreur modification utilisateur', error);

        const message = error?.error?.message ?? 'Erreur lors de la modification du compte utilisateur.';

        this.toastService.error(message);
      }
    });
  }


  goBack(): void {
    this.router.navigate(['/admin/utilisateur/list']);
  }
}