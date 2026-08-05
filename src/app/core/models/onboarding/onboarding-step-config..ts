import { Type } from '@angular/core';

import { OnboardingStep } from './onboarding-step.enum';

export interface OnboardingStepConfig {

  step: OnboardingStep;

  title: string;

  description: string;

  icon: string;

  component: Type<unknown>;

}