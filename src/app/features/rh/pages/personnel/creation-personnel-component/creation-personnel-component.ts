import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypePersonnelResponse } from '../../../../../core/models/rh/type-personnel-response.model';
import { RolesResponse } from '../../../../../core/models/role/roles-response.model';
import { RhResourceService } from '../../../services/rh-resource-service';
import { RoleTenantService } from '../../../../administration/role-tenant/services/role-tenant-service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PersonnelRequest } from '../../../../../core/models/rh/personnel-request.model';

@Component({
  selector: 'app-creation-personnel-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './creation-personnel-component.html',
  styleUrl: './creation-personnel-component.css',
})
export class CreationPersonnelComponent implements OnInit {

  personnelFormGroup!: FormGroup;

  typePersonnels: TypePersonnelResponse[] = [];

  roles: RolesResponse[] = [];

  loading = false;

  loadingTypes = false;

  loadingRoles = false;

  creerCompte = false;

  title = 'Création d’un personnel';


  private readonly personnelApiService = inject(RhResourceService);
  private readonly roleTenantService = inject(RoleTenantService);
  private readonly toastService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.initializeForm();
    this.loadTypePersonnels();
    this.loadRoles();
  }

  private initializeForm(): void {
    this.personnelFormGroup = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      mobile: ['', [Validators.maxLength(30)]],
      cni: ['', [Validators.maxLength(50)]],
      address: ['', [Validators.maxLength(250)]],
      matricule: ['', [Validators.required, Validators.maxLength(50)]],
      typePersonnelUuid: ['', Validators.required],
      dateDebutService: ['', Validators.required],
      dateFinService: [''],
      statut: ['ACTIF', Validators.maxLength(30)],
      eligiblePaie: [true],
      creerCompte: [false],
      login: [''],
      roleUuid: ['']
    });
  }

  private loadTypePersonnels(): void {

    this.loadingTypes = true;

    this.personnelApiService.getResourceList('types-personnel')
      .subscribe({
        next: (types: any) => {

          this.typePersonnels = types ?? [];

          this.loadingTypes = false;
        },
        error: (error) => {
          this.loadingTypes = false;
          console.error(
            'Erreur lors du chargement des types de personnel',
            error
          );
          this.toastService.error('Impossible de charger les types de personnel.');
        }
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
        console.error(
          'Erreur lors du chargement des rôles',
          error
        );
        this.toastService.error('Impossible de charger les rôles disponibles.');
      }
    });
  }

  onCreerCompteChange(): void {
    this.creerCompte = this.personnelFormGroup.get('creerCompte')?.value === true;

    const loginControl = this.personnelFormGroup.get('login');
    const roleControl = this.personnelFormGroup.get('roleUuid');

    if (this.creerCompte) {

      loginControl?.setValidators([
        Validators.required,
        Validators.maxLength(150)
      ]);

      roleControl?.setValidators([
        Validators.required
      ]);

    } else {

      loginControl?.clearValidators();

      roleControl?.clearValidators();

      loginControl?.setValue('');

      roleControl?.setValue('');
    }

    loginControl?.updateValueAndValidity();

    roleControl?.updateValueAndValidity();
  }

  ajouterPersonnel(): void {

    if (this.personnelFormGroup.invalid) {
      this.personnelFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.personnelFormGroup.getRawValue();

    const payload: PersonnelRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email?.trim() || undefined,
      mobile: formValue.mobile?.trim() || undefined,
      cni: formValue.cni?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      matricule: formValue.matricule.trim(),
      typePersonnelUuid: formValue.typePersonnelUuid,
      dateDebutService: formValue.dateDebutService,
      dateFinService: formValue.dateFinService || undefined,
      statut: formValue.statut?.trim() || 'ACTIF',
      eligiblePaie: formValue.eligiblePaie !== false
    };

    if (formValue.creerCompte) {
      payload.compteUtilisateur = {
        creer: true,
        login: formValue.login.trim(),
        roleUuid: formValue.roleUuid
      };

    }

    this.loading = true;

    this.personnelApiService.createPersonnel(payload).subscribe({

      next: (response) => {

        this.loading = false;

        console.log('Personnel créé', response);

        this.toastService.success('Le personnel a été créé avec succès.');

        this.router.navigate(
          ['/admin/rh/personnel/success-creation'],
          {
            state: {
              creationResponse: response
            }
          }
        );

      },

      error: (error) => {

        this.loading = false;

        console.error('Erreur création personnel', error);

        const message =
          error?.error?.message ??
          'Erreur lors de la création du personnel.';

        this.toastService.error(message);
      }
    });
  }


  goBack(): void {
    this.router.navigate(['/admin/rh/personnels']);
  }
}
