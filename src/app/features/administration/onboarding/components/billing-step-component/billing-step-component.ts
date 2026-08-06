import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingInvoiceRequest } from '../../../../../core/models/onboarding/onboarding-invoice-request';
import { OnboardingStateService } from '../../service/onboarding-state.service';


@Component({
  selector: 'app-billing-step-component',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './billing-step-component.html',
  styleUrl: './billing-step-component.css'
})
export class BillingStepComponent implements OnboardingStepComponent<OnboardingInvoiceRequest> {

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(OnboardingStateService);

  readonly form = this.fb.group({
    commentaire: ['']
  });

  constructor() {
    const request =
      this.state.request().onboardingInvoiceRequest;
    if (request) {
      this.form.patchValue(request);
    }

  }

  get value(): OnboardingInvoiceRequest {
    return this.form.getRawValue() as OnboardingInvoiceRequest;
  }

  isValid(): boolean {

    return this.form.valid;

  }

  markTouched(): void {

    this.form.markAllAsTouched();

  }


}