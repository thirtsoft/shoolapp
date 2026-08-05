import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingReferentialService } from '../../service/onboarding-referential.service';
import { CountryResponse } from '../../../../../core/models/onboarding/country-response';
import { CurrencyResponse } from '../../../../../core/models/onboarding/currency-response';
import { LanguageResponse } from '../../../../../core/models/onboarding/language-response';
import { TimeZoneResponse } from '../../../../../core/models/onboarding/time-zone-response';
import { TenantTypeResponse } from '../../../../../core/models/onboarding/type-tenant-response';
import { OnboardingTenantRequest } from '../../../../../core/models/onboarding/onboarding-tenant-request';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tenant-step-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-step-component.html',
  styleUrl: './tenant-step-component.css',
})
export class TenantStepComponent implements OnboardingStepComponent<OnboardingTenantRequest> {

  private readonly fb = inject(FormBuilder);
  private readonly referential = inject(OnboardingReferentialService);

  readonly countries = signal<CountryResponse[]>([]);
  readonly currencies = signal<CurrencyResponse[]>([]);
  readonly languages = signal<LanguageResponse[]>([]);
  readonly timezones = signal<TimeZoneResponse[]>([]);
  readonly tenantTypes = signal<TenantTypeResponse[]>([]);
  readonly loading = signal<boolean>(true);

  readonly error = signal<string | null>(null);

  form = this.fb.group({
    libelle: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    countryUuid: ['', Validators.required],
    currencyUuid: ['', Validators.required],
    languageUuid: ['', Validators.required],
    timezoneUuid: ['', Validators.required],
    tenantTypeUuid: ['', Validators.required],
    domaine: ['', [Validators.required]]
  });

  constructor() {
    this.loadReferentials();
  }

  get value(): OnboardingTenantRequest {

    return this.form.getRawValue() as OnboardingTenantRequest;

  }

  isValid(): boolean {
    return this.form.valid;
  }

  markTouched(): void {
    this.form.markAllAsTouched();
  }

  private loadReferentials(): void {

    this.loading.set(true);

    this.referential.getCountries()
      .pipe(takeUntilDestroyed())
      .subscribe({

        next: response => {

          if (response.success) {

            this.countries.set(
              response.data
            );

          }

        }

      });

    this.referential.getCurrencies()
      .pipe(takeUntilDestroyed())
      .subscribe({

        next: response => {

          if (response.success) {

            this.currencies.set(
              response.data
            );

          }

        }

      });

    this.referential.getLanguages()
      .pipe(takeUntilDestroyed())
      .subscribe({

        next: response => {

          if (response.success) {

            this.languages.set(
              response.data
            );

          }

        }

      });

    this.referential.getTimezones()
      .pipe(takeUntilDestroyed())
      .subscribe({

        next: response => {

          if (response.success) {
            this.timezones.set(
              response.data
            );

          }

        }

      });

    this.referential.getTenantTypes()
      .pipe(takeUntilDestroyed())
      .subscribe({

        next: response => {

          if (response.success) {

            this.tenantTypes.set(
              response.data
            );

          }
          this.loading.set(false);
        },

        error: () => {

          this.error.set(
            'Impossible de charger les informations nécessaires.'
          );
          this.loading.set(false);

        }

      });
  }

}