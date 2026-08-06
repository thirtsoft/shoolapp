import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingUserRequest } from '../../../../../core/models/onboarding/onboarding-user-request';
import { OnboardingStateService } from '../../service/onboarding-state.service';

@Component({
  selector: 'app-user-step-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-step-component.html',
  styleUrl: './user-step-component.css',
})

export class UserStepComponent implements OnboardingStepComponent<OnboardingUserRequest> {

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(OnboardingStateService);

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    emailContact: ['', [Validators.required, Validators.email]],
    mobileContact: ['', [Validators.required]]
  });

  constructor() {
    const request = this.state.request().onboardingUserRequest;
    if (request) {
      this.form.patchValue(request);
    }
  }

  get value(): OnboardingUserRequest {
    return this.form.getRawValue() as OnboardingUserRequest;
  }

  isValid(): boolean {
    return this.form.valid;
  }

  markTouched(): void {
    this.form.markAllAsTouched();

  }

}
