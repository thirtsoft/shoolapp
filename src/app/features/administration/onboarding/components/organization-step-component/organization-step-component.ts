import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryResponse } from '../../../../../core/models/onboarding/country-response';
import { DepartmentResponse } from '../../../../../core/models/onboarding/department-response';
import { OnboardingOrganizationRequest } from '../../../../../core/models/onboarding/onboarding-organization-request';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { RegionResponse } from '../../../../../core/models/onboarding/region-response';
import { OrganizationTypeResponse } from '../../../../../core/models/onboarding/type-organization-response';
import { OnboardingReferentialService } from '../../service/onboarding-referential.service';
import { OnboardingStateService } from '../../service/onboarding-state.service';

@Component({
  selector: 'app-organization-step-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './organization-step-component.html',
  styleUrl: './organization-step-component.css',
})
export class OrganizationStepComponent implements OnboardingStepComponent<OnboardingOrganizationRequest> {

  private readonly fb = inject(FormBuilder);
  private readonly referential = inject(OnboardingReferentialService);
  private readonly state = inject(OnboardingStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly organizationTypes = signal<OrganizationTypeResponse[]>([]);
  readonly countries = signal<CountryResponse[]>([]);
  readonly regions = signal<RegionResponse[]>([]);
  readonly departments = signal<DepartmentResponse[]>([]);
  readonly loading = signal<boolean>(true);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    organizationTypeUuid: ['', Validators.required],
    libelle: ['', [Validators.required, Validators.minLength(3)]],
    code: ['', [Validators.required, Validators.minLength(3)]],
    sigle: [''],
    countryUuid: ['', Validators.required],
    regionUuid: ['', Validators.required],
    departmentUuid: ['', Validators.required],
    adresse: [''],
    boitePostale: [''],
    telephone: [''],
    mobile: ['', Validators.required],
    email: ['', Validators.email],
    siteWeb: [''],
    logoFileUuid: [''],
    description: ['']

  });

  constructor() {
    this.loadInitialData();
    this.restoreForm();
  }

  private restoreForm(): void {
    const request = this.state.request().onboardingOrganizationRequest;
    if (!request) {
      return;
    }
    this.form.patchValue(request);
    if (request.countryUuid) {
      this.loadRegions(
        request.countryUuid,
        request.regionUuid ?? undefined,
        request.departmentUuid ?? undefined
      );
    }
  }

  private loadRegions(countryUuid: string, regionUuid?: string, departmentUuid?: string): void {

    this.referential.getRegions(countryUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.success) {
            return;
          }
          this.regions.set(response.data);
          if (regionUuid) {
            this.form.patchValue({ regionUuid });
            this.loadDepartments(regionUuid, departmentUuid);
          }
        }
      });
  }

  private loadDepartments(regionUuid: string, departmentUuid?: string): void {
    this.referential.getDepartments(regionUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (!response.success) {
            return;
          }
          this.departments.set(response.data);
          if (departmentUuid) {
            this.form.patchValue({ departmentUuid });
          }
        }
      });
  }

  get value(): OnboardingOrganizationRequest {
    return this.form.getRawValue() as OnboardingOrganizationRequest;
  }

  isValid(): boolean {
    return this.form.valid;
  }

  markTouched(): void {
    this.form.markAllAsTouched();
  }

  private loadInitialData(): void {
    this.loading.set(true);

    this.referential.getTypeOrganizations()

      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({

        next: response => {

          if (response.success) {
            this.organizationTypes.set(response.data);

          }

        }

      });

    this.referential.getCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({

        next: response => {

          if (response.success) {
            this.countries.set(response.data);
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

  /*
  onCountryChange(): void {
    const countryUuid = this.form.controls.countryUuid.value;

    if (!countryUuid) {

      this.form.patchValue({
        regionUuid: '',
        departmentUuid: ''
      });

      this.regions.set([]);
      this.departments.set([]);

      return;
    }

    this.form.patchValue({
      regionUuid: '',
      departmentUuid: ''
    });

    this.departments.set([]);

    this.referential.getRegions(countryUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: response => {

          if (response.success) {

            this.regions.set(response.data);

          }

        },

        error: () => {

          this.error.set(
            'Impossible de charger les régions.'
          );

        }

      });

  }*/

  onCountryChange(): void {

    const countryUuid = this.form.controls.countryUuid.value;

    this.form.patchValue({
      regionUuid: '',
      departmentUuid: ''
    });

    this.regions.set([]);
    this.departments.set([]);

    if (!countryUuid) {
      return;
    }

    this.loadRegions(countryUuid);
  }

  /*
  onRegionChange(regionUuid: string): void {

    this.form.patchValue({
      departmentUuid: ''
    });

    this.departments.set([]);


    if (!regionUuid) {
      return;
    }


    this.referential.getDepartments(regionUuid)

      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )

      .subscribe({

        next: response => {

          if (response.success) {

            this.departments.set(
              response.data
            );

          }

        },

        error: () => {

          this.error.set(
            'Impossible de charger les départements.'
          );

        }

      });

  } */

  onRegionChange(regionUuid: string): void {

    this.form.patchValue({
      departmentUuid: ''
    });

    this.departments.set([]);

    if (!regionUuid) {
      return;
    }

    this.loadDepartments(regionUuid);

  }
}
