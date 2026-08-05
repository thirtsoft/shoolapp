import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnboardingStepComponent } from '../../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingStartRequest } from '../../../../../core/models/onboarding/onboarding-start-request';
import { OnboardingMode } from '../../../../../core/models/onboarding/onboarding-mode.enum';

@Component({
  selector: 'app-onboarding-stepper-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './onboarding-stepper-component.html',
  styleUrl: './onboarding-stepper-component.css',
})
export class OnboardingStepperComponent implements OnboardingStepComponent<OnboardingStartRequest> {

  private readonly fb = inject(FormBuilder);

  
  applications = [

    {
      code: 'MYSCHOOL',
      label: 'MySchool',
      description:
        'Solution de gestion complète pour les établissements scolaires.'
    },

    {
      code: 'XALISPAIN',
      label: 'XalisPain',
      description:
        'Solution de gestion pour les commerces et points de vente.'
    }

  ];

  modes = [

    {
      code: OnboardingMode.TRIAL,
      label: 'Essai gratuit',
      description:
        'Découvrez la plateforme pendant une période limitée.'
    },


    {
      code: OnboardingMode.STANDARD,
      label: 'Abonnement standard',
      description:
        'Démarrez directement avec une formule active.'
    }

  ];


  readonly form = this.fb.group({
    applicationCode: ['',  Validators.required],
    onboardingMode: ['',Validators.required]

  });

  get value(): OnboardingStartRequest {
    
    return this.form.getRawValue() as OnboardingStartRequest;

  }

  isValid(): boolean {

    return this.form.valid;

  }

  markTouched(): void {

    this.form.markAllAsTouched();

  }


}
