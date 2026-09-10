import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserResponse } from '../../../../../core/models/utilisateur/user-response.model';
import { UserApiService } from '../../service/user-api.service';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mon-profil.component.html',
  styleUrls: ['./mon-profil.component.css']
})
export class MonProfilComponent implements OnInit {

  private readonly userApiService = inject(UserApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  isEditing = signal(false);
  editingSection = signal<'identity' | 'security' | null>(null);
  user!: UserResponse;
  error = signal('');

  identityForm!: FormGroup;
  securityForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserProfile();
  }

  private initializeForms(): void {
    this.identityForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      birthDate: [''],
      photo: ['']
    });
    this.securityForm = this.formBuilder.group({
      identifier: ['', [Validators.required]]
    });
  }

  private loadUserProfile(): void {
    const userData = localStorage.getItem('v2_user');
    if (!userData) {
      this.error.set('Utilisateur non connecté');
      this.loading.set(false);
      this.toastService.warning('error', 'utilisateur non trouvé');
      return;
    }
    const userUuid = JSON.parse(userData).uuid;
    console.log('UserUuid is ', userUuid);
    this.loading.set(true);
    this.userApiService.getUserProfil(userUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.user = response.data;
          this.populateForms(this.user);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement profil:', error);
          this.toastService.error('Erreur', 'Impossible de charger le profil');
          this.loading.set(false);
        }
      });
  }

  private populateForms(user: UserResponse): void {
    // Remplir formulaire identité
    this.identityForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      mobile: user.mobile || '',
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      photo: user.photo || ''
    });

    // Remplir formulaire sécurité (SEULEMENT l'identifier)
    this.securityForm.patchValue({
      identifier: user.identifier || ''
    });
  }

  enableEditing(section: 'identity' | 'security'): void {
    this.editingSection.set(section);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.editingSection.set(null);
    this.isEditing.set(false);
    this.populateForms(this.user);
  }

  /**
   * Sauvegarder les modifications d'identité
   */
  saveIdentity(): void {
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const userData = localStorage.getItem('v2_user');
    if (!userData) {
      this.error.set('Utilisateur non connecté');
      this.loading.set(false);
      this.toastService.warning('error', 'utilisateur non trouvé');
      return;
    }
    this.loading.set(true);
    const payload = {
      firstName: this.identityForm.get('firstName')?.value,
      lastName: this.identityForm.get('lastName')?.value,
      email: this.identityForm.get('email')?.value,
      mobile: this.identityForm.get('mobile')?.value,
      birthDate: this.identityForm.get('birthDate')?.value,
      photo: this.identityForm.get('photo')?.value
    };
    const userUuid = JSON.parse(userData).uuid;
    this.userApiService.updateUtilisateurTenant(userUuid, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.user = { ...this.user, ...payload };
          this.toastService.success('Succès', 'Informations mises à jour avec succès');
          this.editingSection.set(null);
          this.isEditing.set(false);
          this.loading.set(false);
          this.updateLocalStorage(payload);
        },
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.toastService.error('Erreur', 'Impossible de mettre à jour les informations');
          this.loading.set(false);
        }
      });
  }

  /**
   * Sauvegarder les modifications de sécurité
   * UNIQUEMENT l'identifiant est modifiable
   * Le rôle, enabled et accountLocked sont gérés par l'administrateur
   */
  saveSecurity(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      this.toastService.warning('Attention', 'L\'identifiant est obligatoire');
      return;
    }
    const userData = localStorage.getItem('v2_user');
    if (!userData) {
      this.error.set('Utilisateur non connecté');
      this.loading.set(false);
      this.toastService.warning('error', 'utilisateur non trouvé');
      return;
    }

    this.loading.set(true);

    // Payload avec UNIQUEMENT l'identifier
    // Le rôle, enabled et accountLocked ne sont PAS envoyés
    const payload = {
      identifier: this.securityForm.get('identifier')?.value
    };

    const userUuid = JSON.parse(userData).uuid;
    this.userApiService.updateUtilisateurTenant(userUuid, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.user = { ...this.user, ...payload };
          this.toastService.success('Succès', 'Identifiant mis à jour avec succès');
          this.editingSection.set(null);
          this.isEditing.set(false);
          this.loading.set(false);
          this.updateLocalStorage(payload);
        },
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.toastService.error('Erreur', 'Impossible de mettre à jour l\'identifiant');
          this.loading.set(false);
        }
      });
  }

  private updateLocalStorage(data: any): void {
    try {
      const currentUser = localStorage.getItem('v2_user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const updatedUser = { ...user, ...data };
        localStorage.setItem('v2_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erreur mise à jour localStorage:', error);
    }
  }

  goToChangePassword(): void {
    this.router.navigate(['/admin/utilisateur/change-password']);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Obtenir le libellé du rôle à partir du code
   */
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      GERANT: 'Gérant',
      PROFESSEUR: 'Professeur',
      ELEVE: 'Élève',
      PARENT: 'Parent',
      CAISSIER: 'Caissier'
    };
    return labels[role] || role;
  }

  getAccountStatus(): { label: string; class: string } {
    if (!this.user?.enabled) {
      return { label: 'Désactivé', class: 'danger' };
    }
    if (this.user?.accountLocked) {
      return { label: 'Verrouillé', class: 'warning' };
    }
    return { label: 'Actif', class: 'success' };
  }
}