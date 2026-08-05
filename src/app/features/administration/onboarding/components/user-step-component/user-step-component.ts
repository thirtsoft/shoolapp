import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingUserRequest } from '../../../../../core/models/onboarding/onboarding-user-request';

@Component({
  selector: 'app-user-step-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-step-component.html',
  styleUrl: './user-step-component.css',
})

export class UserStepComponent implements OnboardingStepComponent<OnboardingUserRequest> {


  private readonly fb = inject(FormBuilder);


  form = this.fb.group({

    firstName: [
      '',
      [
        Validators.required,
        Validators.minLength(2)
      ]
    ],

    lastName: [
      '',
      [
        Validators.required,
        Validators.minLength(2)
      ]
    ],

    emailContact: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    mobileContact: [
      '',
      [
        Validators.required
      ]
    ]

  });



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
