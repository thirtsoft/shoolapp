import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrganizationResponse } from '../../../../../core/models/onboarding/organization/organization-response';
import { OrganizationRequest } from '../../../../../core/models/organization/organization-request.model';
import { ConfigOrganizationService } from '../../services/configorganization.service';

@Component({
  selector: 'app-mon-organization-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mon-organization-component.html',
  styleUrl: './mon-organization-component.css',
})
export class MonOrganizationComponent implements OnInit {

  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  isEditing = signal(false);
  editingSection = signal<'identification' | 'location' | 'logo' | null>(null);
  organizationData!: OrganizationResponse;
  error = signal('');
  
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;
  uploadingLogo = signal(false);

  identificationForm!: FormGroup;
  locationForm!: FormGroup;

  schoolTypes = [
    { value: 'PRIVE', label: 'Privé' },
    { value: 'PUBLIC', label: 'Public' },
    { value: 'SEMI_PRIVE', label: 'Semi-privé' }
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.loadOrganizationInfos();
  }

  private initializeForms(): void {
    this.identificationForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      libelle: ['', [Validators.required]],
      sigle: ['', [Validators.required]],
      schoolType: ['', [Validators.required]],
      anneeCreation: [''],
      description: ['']
    });

    this.locationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      telephone: [''],
      adresse: [''],
      boitePostale: [''],
      siteWeb: [''],
      regionCode: ['']
    });
  }

  private loadOrganizationInfos(): void {
    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.loading.set(false);
      this.toastService.warning('Attention', 'Organisation non trouvée');
      return;
    }
    
    this.loading.set(true);
    this.organizationConfigService.getOrganizationInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.organizationData = response;
          console.log('Organization data', this.organizationData);
          this.populateForms(this.organizationData);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
          this.loading.set(false);
        }
      });
  }

  private populateForms(org: OrganizationResponse): void {
    this.identificationForm.patchValue({
      code: org.code || '',
      libelle: org.libelle || '',
      sigle: org.sigle || '',
      schoolType: org.schoolType || '',
      anneeCreation: org.anneeCreation || '',
      description: org.description || ''
    });

    this.locationForm.patchValue({
      email: org.email || '',
      mobile: org.mobile || '',
      telephone: org.telephone || '',
      adresse: org.adresse || '',
      boitePostale: org.boitePostale || '',
      siteWeb: org.siteWeb || '',
      regionCode: org.regionCode || ''
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
    
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.warning('Attention', 'Le fichier ne doit pas dépasser 2 Mo');
        return;
      }
      
      if (!file.type.match(/image\/(jpeg|png|jpg|svg\+xml)/)) {
        this.toastService.warning('Attention', 'Format non supporté. Utilisez JPG, PNG ou SVG');
        return;
      }
      
      this.selectedLogoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.warning('Attention', 'Le fichier ne doit pas dépasser 2 Mo');
        return;
      }
      
      if (!file.type.match(/image\/(jpeg|png|jpg|svg\+xml)/)) {
        this.toastService.warning('Attention', 'Format non supporté');
        return;
      }
      
      this.selectedLogoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveLogo(): void {
    if (!this.selectedLogoFile) {
      this.toastService.warning('Attention', 'Veuillez sélectionner un logo');
      return;
    }

    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.toastService.error('Erreur', 'Organisation non trouvée');
      return;
    }

    this.uploadingLogo.set(true);
    const formData = new FormData();
    formData.append('logo', this.selectedLogoFile);

    /*
    this.organizationConfigService.uploadLogo(organizationUuid, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toastService.success('Succès', 'Logo mis à jour avec succès');
          this.selectedLogoFile = null;
          this.logoPreview = null;
          this.uploadingLogo.set(false);
          this.loadOrganizationInfos();
        },
        error: (error) => {
          console.error('Erreur upload logo:', error);
          this.toastService.error('Erreur', 'Impossible de mettre à jour le logo');
          this.uploadingLogo.set(false);
        }
      });
      */
  }

  deleteLogo(): void {
    if (!confirm('Voulez-vous vraiment supprimer le logo ?')) {
      return;
    }

    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) return;
    /*

    this.uploadingLogo.set(true);
    this.organizationConfigService.deleteLogo(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'Logo supprimé');
          this.organizationData.logoFileUid = null;
          this.uploadingLogo.set(false);
        },
        error: (error) => {
          console.error('Erreur suppression logo:', error);
          this.toastService.error('Erreur', 'Impossible de supprimer le logo');
          this.uploadingLogo.set(false);
        }
      });

      */
  }

  cancelLogoEdit(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
    this.editingSection.set(null);
  }
  
  enableEditing(section: 'identification' | 'location' | 'logo'): void {
    this.editingSection.set(section);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.editingSection.set(null);
    this.isEditing.set(false);
    this.populateForms(this.organizationData);
  }
  
  saveIdentification(): void {
    if (this.identificationForm.invalid) {
      this.identificationForm.markAllAsTouched();
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.toastService.error('Erreur', 'Organisation non trouvée');
      return;
    }

    this.loading.set(true);
    const payload: OrganizationRequest = {
      code: this.identificationForm.get('code')?.value,
      libelle: this.identificationForm.get('libelle')?.value,
      sigle: this.identificationForm.get('sigle')?.value,
      schoolType: this.identificationForm.get('schoolType')?.value,
      anneeCreation: this.identificationForm.get('anneeCreation')?.value,
      description: this.identificationForm.get('description')?.value
    };

    this.organizationConfigService.updateOranizationInfo(organizationUuid, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.organizationData = { ...this.organizationData, ...payload };
          this.toastService.success('Succès', 'Identification mise à jour avec succès');
          this.editingSection.set(null);
          this.isEditing.set(false);
          this.loading.set(false);
          this.updateLocalStorage(payload);
        },
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.toastService.error('Erreur', 'Impossible de mettre à jour l\'identification');
          this.loading.set(false);
        }
      });
  }
  
  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.toastService.error('Erreur', 'Organisation non trouvée');
      return;
    }

    this.loading.set(true);
    const payload: OrganizationRequest = {
      email: this.locationForm.get('email')?.value,
      mobile: this.locationForm.get('mobile')?.value,
      telephone: this.locationForm.get('telephone')?.value,
      adresse: this.locationForm.get('adresse')?.value,
      boitePostale: this.locationForm.get('boitePostale')?.value,
      siteWeb: this.locationForm.get('siteWeb')?.value,
      regionCode: this.locationForm.get('regionCode')?.value
    };

    this.organizationConfigService.updateOranizationInfo(organizationUuid, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.organizationData = { ...this.organizationData, ...payload };
          this.toastService.success('Succès', 'Coordonnées mises à jour avec succès');
          this.editingSection.set(null);
          this.isEditing.set(false);
          this.loading.set(false);
          this.updateLocalStorage(payload);
        },
        error: (error) => {
          console.error('Erreur mise à jour:', error);
          this.toastService.error('Erreur', 'Impossible de mettre à jour les coordonnées');
          this.loading.set(false);
        }
      });
  }
  
  private updateLocalStorage(data: any): void {
    try {
      const currentOrg = localStorage.getItem('v2_organization');
      if (currentOrg) {
        const org = JSON.parse(currentOrg);
        const updatedOrg = { ...org, ...data };
        localStorage.setItem('v2_organization', JSON.stringify(updatedOrg));
      }
    } catch (error) {
      console.error('Erreur mise à jour localStorage:', error);
    }
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

  getSchoolTypeLabel(type: string): string {
    const found = this.schoolTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  getStatusLabel(status: string): { label: string; class: string } {
    const map: Record<string, { label: string; class: string }> = {
      ACTIVE: { label: 'Active', class: 'success' },
      INACTIVE: { label: 'Inactive', class: 'danger' },
      PENDING: { label: 'En attente', class: 'warning' },
      SUSPENDED: { label: 'Suspendue', class: 'danger' }
    };
    return map[status] || { label: status, class: 'info' };
  }
}
