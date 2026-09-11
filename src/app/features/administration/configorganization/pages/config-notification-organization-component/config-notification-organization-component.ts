import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigOrganizationService } from '../../services/configorganization.service';
import { ToastrService } from 'ngx-toastr';
import {
  NotificationConfigurationUpdateRequest,
} from '../../../../../core/models/notification/notification-configuration-update-request';
import {
  NotificationConfigurationResponse,
} from '../../../../../core/models/notification/notification-configuration-response';

@Component({
  selector: 'app-config-notification-organization-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './config-notification-organization-component.html',
  styleUrl: './config-notification-organization-component.css',
})
export class ConfigNotificationOrganizationComponent implements OnInit {

 
  private readonly configurationService = inject(ConfigOrganizationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  saving = signal(false);
  configurationData = signal<NotificationConfigurationResponse | null>(null);
  error = signal('');

  tenantUuid!: string;

  configurationForm!: FormGroup;

  ngOnInit(): void {
    // Récupérer l'UUID du tenant (et non de l'organisation)
    this.tenantUuid = localStorage.getItem('v2_tenant_uuid') || '';

    if (!this.tenantUuid) {
      this.error.set('Tenant non trouvé');
      this.toastService.error('Erreur', 'Tenant non trouvé');
      return;
    }

    this.initializeForm();
    this.loadConfiguration();
  }

  private initializeForm(): void {
    this.configurationForm = this.formBuilder.group({
      senderName: ['', [Validators.required, Validators.maxLength(150)]],
      senderEmail: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      senderPhone: ['', [Validators.maxLength(80)]],
      replyTo: ['', [Validators.email, Validators.maxLength(200)]],
    });
  }

  /**
   * Charge la configuration existante du tenant.
   * Si elle n'existe pas encore (404), on laisse le formulaire vide.
   */
  private loadConfiguration(): void {
    this.loading.set(true);

    this.configurationService.getNotificationConfigurationByTenantUuid(this.tenantUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.configurationData.set(response.data);
            this.populateForm(response.data);
          }
          this.loading.set(false);
        },
        error: (err) => {
          // 404 = pas encore de configuration → formulaire vide
          if (err?.status === 404) {
            this.configurationData.set(null);
          } else {
            console.error('Erreur chargement configuration:', err);
            this.toastService.error('Erreur', 'Impossible de charger la configuration');
          }
          this.loading.set(false);
        }
      });
  }

  private populateForm(config: NotificationConfigurationResponse): void {
    this.configurationForm.patchValue({
      senderName: config.senderName || '',
      senderEmail: config.senderEmail || '',
      senderPhone: config.senderPhone || '',
      replyTo: config.replyTo || '',
    });
  }

  onSubmit(): void {
    if (this.configurationForm.invalid) {
      this.configurationForm.markAllAsTouched();
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.tenantUuid) {
      this.toastService.error('Erreur', 'Tenant non trouvé');
      return;
    }

    this.saving.set(true);

    const payload: NotificationConfigurationUpdateRequest = {
      senderName: this.configurationForm.get('senderName')?.value,
      senderEmail: this.configurationForm.get('senderEmail')?.value,
      senderPhone: this.configurationForm.get('senderPhone')?.value,
      replyTo: this.configurationForm.get('replyTo')?.value,
    };

    this.configurationService.saveOrUpdateNotificationConfiguration(this.tenantUuid, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.configurationData.set(response.data);
            this.toastService.success('Succès', 'Configuration enregistrée avec succès');
          }
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Erreur sauvegarde:', err);
          this.toastService.error('Erreur', 'Impossible d\'enregistrer la configuration');
          this.saving.set(false);
        }
      });
  }

  reset(): void {
    const current = this.configurationData();
    if (current) {
      this.populateForm(current);
    } else {
      this.configurationForm.reset();
    }
  }
}