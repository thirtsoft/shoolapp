import { Component, Input } from '@angular/core';
import { OnboardingStepConfig } from '../../../../core/models/onboarding/onboarding-step-config.';
import { OnboardingStep } from '../../../../core/models/onboarding/onboarding-step.enum';

@Component({
  selector: 'app-onboarding-progress-component',
  standalone: true,
  imports: [],
  templateUrl: './onboarding-progress-component.html',
  styleUrl: './onboarding-progress-component.css',
})
export class OnboardingProgressComponent {

  @Input({ required: true })
  steps!: OnboardingStepConfig[];

  @Input({ required: true })
  currentStep!: OnboardingStep;

  @Input()
  completedSteps: OnboardingStep[] = [];

  isActive(step: OnboardingStep): boolean {

    return step === this.currentStep;

  }

  isCompleted(step: OnboardingStep): boolean {

    return this.completedSteps.includes(step);

  }

}