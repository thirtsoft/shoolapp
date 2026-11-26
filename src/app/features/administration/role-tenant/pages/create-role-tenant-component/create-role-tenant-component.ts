import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { PermissionGroupResponse } from '../../../../../core/models/permission/permission-group-response.model';
import { PermissionResponse } from '../../../../../core/models/permission/permission-response.model';
import { RoleCreateRequest } from '../../../../../core/models/role/role-create-request.model';
import { RoleResponse } from '../../../../../core/models/role/role-response.model';

import { RoleUpdateRequest } from '../../../../../core/models/role/role-update-request.model';
import { RoleTenantService } from '../../services/role-tenant-service';

@Component({
  selector: 'app-create-role-tenant-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-role-tenant-component.html',
  styleUrl: './create-role-tenant-component.css',
})
export class CreateRoleTenantComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleTenantService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  roleForm!: FormGroup;

  permissionGroups: PermissionGroupResponse[] = [];

  selectedPermissionUuids = new Set<string>();


  loadingPermissions = false;
  loadingRole = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  currentStep = 1;

  role?: RoleResponse;

  roleUuid: string | null = null;

  ngOnInit(): void {

    this.initForm();

    this.roleUuid = this.activeRoute.snapshot.paramMap.get('uuid');

    this.loadPermissions();

    if (this.roleUuid) {
      this.loadRole(this.roleUuid);
    }
  }

  get isEditMode(): boolean {
    return !!this.roleUuid;
  }


  private initForm(): void {

    this.roleForm = this.fb.group({

      code: ['', [Validators.required, Validators.maxLength(30)]],

      libelle: ['', [Validators.required, Validators.maxLength(120)]],

      description: ['', [Validators.maxLength(500)]]

    });
  }


  private loadPermissions(): void {

    this.loadingPermissions = true;
    this.errorMessage = '';

    this.roleService
      .getAllPermissions()
      .pipe(finalize(() => { this.loadingPermissions = false; }))
      .subscribe({

        next: (groups) => {

          this.permissionGroups = groups;

        },

        error: (error) => {

          console.error(
            'Erreur chargement permissions :',
            error
          );

          this.errorMessage = 'Impossible de charger les permissions disponibles.';
        }

      });
  }

  private loadRole(roleUuid: string): void {

    this.loadingRole = true;
    this.errorMessage = '';

    this.roleService
      .getRoleByUuid(roleUuid)
      .pipe(finalize(() => { this.loadingRole = false; }))
      .subscribe({

        next: (role) => {

          console.log('Rôle chargé :', role);

          this.role = role;

          this.roleForm.patchValue({

            code: role.code ?? '',

            libelle: role.libelle ?? '',

            description: role.description ?? ''

          });

          this.selectedPermissionUuids = new Set(role.permissionUuids ?? []);

        },

        error: (error) => {

          console.error(
            'Erreur chargement rôle :',
            error
          );

          this.errorMessage = 'Impossible de charger le rôle.';

        }

      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.roleForm.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Ce champ est obligatoire.';
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength')?.requiredLength;
      return `Le champ ne doit pas dépasser ${maxLength} caractères.`;
    }

    return 'Valeur invalide.';
  }

  goToPermissions(): void {
    this.roleForm.markAllAsTouched();

    if (this.roleForm.invalid) {
      return;
    }
    this.currentStep = 2;
  }

  goBackToInformation(): void {
    if (this.saving) {
      return;
    }

    this.currentStep = 1;
  }

  selectPermission(permission: PermissionResponse, checked: boolean): void {
    if (checked) {
      this.selectedPermissionUuids.add(permission.uuid);

    } else {
      this.selectedPermissionUuids.delete(permission.uuid);
    }
  }

  isPermissionSelected(permissionUuid: string): boolean {
    return this.selectedPermissionUuids.has(permissionUuid);
  }

  isModuleFullySelected(group: PermissionGroupResponse): boolean {
    if (!group.permissions.length) {
      return false;
    }

    return group.permissions.every(permission => this.selectedPermissionUuids.has(permission.uuid)
    );
  }

  isModulePartiallySelected(group: PermissionGroupResponse): boolean {
    const selectedCount = group.permissions.filter(
      permission => this.selectedPermissionUuids.has(permission.uuid)).length;
    return (selectedCount > 0 && selectedCount < group.permissions.length);
  }

  toggleModule(group: PermissionGroupResponse): void {
    const fullySelected = this.isModuleFullySelected(group);
    group.permissions.forEach(permission => {
      if (fullySelected) {
        this.selectedPermissionUuids.delete(permission.uuid);

      } else {
        this.selectedPermissionUuids.add(permission.uuid);
      }

    });
  }

  get selectedPermissionCount(): number {
    return this.selectedPermissionUuids.size;
  }

  submit(): void {
    this.roleForm.markAllAsTouched();

    if (this.roleForm.invalid) {

      this.currentStep = 1;

      return;
    }

    if (this.selectedPermissionCount === 0) {

      this.errorMessage = 'Veuillez sélectionner au moins une permission.';

      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const code = this.roleForm.get('code')?.value?.trim();

    const libelle = this.roleForm.get('libelle')?.value?.trim();

    const description = this.roleForm.get('description')?.value?.trim() || null;

    const permissionUids = Array.from(this.selectedPermissionUuids);

    if (!this.isEditMode) {

      const request: RoleCreateRequest = {

        code,

        libelle,

        description,

        permissionUids

      };

      this.roleService
        .createRole(request)
        .pipe(finalize(() => { this.saving = false; }))
        .subscribe({

          next: () => {

            this.toastService.success(
              'Le rôle a été créé avec succès.',
              'Succès'
            );

            this.goBack();
          },

          error: (error) => {

            console.error(
              'Erreur création rôle :',
              error
            );

            this.errorMessage = error?.error?.message ?? 'Impossible de créer le rôle.';
          }

        });

      return;
    }

    const request: RoleUpdateRequest = {

      code,

      libelle,

      description,

      permissionUids

    };

    this.roleService
      .updateRole(this.roleUuid!, request)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe({

        next: () => {
          this.toastService.success('Le rôle a été modifié avec succès.', 'Succès');
          this.goBack();
        },

        error: (error) => {
          console.error('Erreur modification rôle :', error);

          this.errorMessage = error?.error?.message ?? 'Impossible de modifier le rôle.';

        }

      });
  }

  goBack(): void {
    void this.router.navigate(['/admin/roles']);
  }
}