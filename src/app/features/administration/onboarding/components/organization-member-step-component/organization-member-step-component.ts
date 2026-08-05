import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingOrganizationMemberRequest } from '../../../../../core/models/onboarding/onboarding-organization-member-request';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';

@Component({
  selector: 'app-organization-member-step-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './organization-member-step-component.html',
  styleUrl: './organization-member-step-component.css',
})
export class OrganizationMemberStepComponent implements OnboardingStepComponent<OnboardingOrganizationMemberRequest> {


  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    fonction: ['', [Validators.required, Validators.minLength(3)]]
  });

  get value(): OnboardingOrganizationMemberRequest {

    return this.form.getRawValue() as OnboardingOrganizationMemberRequest;

  }

  isValid(): boolean {

    return this.form.valid;

  }

  markTouched(): void {

    this.form.markAllAsTouched();

  }

}
