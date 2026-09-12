import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { PermissionGroupResponse } from '../../../../../core/models/permission/permission-group-response.model';
import { PermissionResponse } from '../../../../../core/models/permission/permission-response.model';
import { RoleCreateRequest } from '../../../../../core/models/role/role-create-request.model';
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

  roleForm!: FormGroup;

  permissionGroups: PermissionGroupResponse[] = [];

  selectedPermissionUuids = new Set<string>();

  loadingPermissions = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  currentStep = 1;

  ngOnInit(): void {
    this.initForm();
    this.loadPermissions();
  }

  private initForm(): void {
    this.roleForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(30)]],
      libelle: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  private loadPermissions(): void {
    this.loadingPermissions = true;
    this.errorMessage = '';

    this.roleService
      .getAllPermissions()
      .pipe(
        finalize(() => {
          this.loadingPermissions = false;
        })
      )
      .subscribe({
        next: (groups) => {
          this.permissionGroups = groups;
        },
        error: (error) => {
          console.error('Erreur chargement permissions', error);

          this.errorMessage = 'Impossible de charger les permissions disponibles.';
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);

    return !!field &&
      field.invalid &&
      (field.dirty || field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {

    const field = this.roleForm.get(fieldName);

    if (!field) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Ce champ est obligatoire.';
    }

    if (field.hasError('maxlength')) {
      return 'La longueur maximale est dépassée.';
    }

    return 'Valeur invalide.';
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
    return group.permissions.every(
      permission => this.selectedPermissionUuids.has(permission.uuid)
    );
  }

  isModulePartiallySelected(group: PermissionGroupResponse): boolean {

    const selectedCount = group.permissions.filter(
      permission => this.selectedPermissionUuids.has(permission.uuid)
    ).length;

    return selectedCount > 0 &&
      selectedCount < group.permissions.length;
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

  goToPermissions(): void {
    this.roleForm.markAllAsTouched();

    if (this.roleForm.invalid) {
      return;
    }
    this.currentStep = 2;
  }

  goBackToInformation(): void {
    this.currentStep = 1;
  }

  goBack(): void {
    history.back();
  }

  submit(): void {
    this.roleForm.markAllAsTouched();

    if (this.roleForm.invalid) {
      this.currentStep = 1;
      return;
    }

    if (this.selectedPermissionUuids.size === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une permission.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    const request: RoleCreateRequest = {
      code: this.roleForm.get('code')?.value?.trim(),
      libelle: this.roleForm.get('libelle')?.value?.trim(),
      description: this.roleForm.get('description')?.value?.trim() || null,
      permissionUids: Array.from(this.selectedPermissionUuids)
    };

    this.roleService.createRole(request)
      .pipe(finalize(() => { this.saving = false; })
      )
      .subscribe({
        next: (response) => {
          console.log('Rôle créé', response);
          this.successMessage = 'Le rôle a été créé avec succès.';
          this.toastService.success('Succès', this.successMessage);
          this.goBack();
        },
        error: (error) => {
          console.error('Erreur création rôle', error);

          this.errorMessage = error?.error?.message ?? 'Une erreur est survenue lors de la création du rôle.';
        }
      });
  }
}
