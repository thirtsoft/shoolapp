import { Injectable, signal } from '@angular/core';
import { OnboardingRequestModel } from '../../../../core/models/onboarding/onboarding-request.model';
import { OnboardingStep } from '../../../../core/models/onboarding/onboarding-step.enum';

@Injectable({
  providedIn: 'root'
})
export class OnboardingSateService {

  private readonly requestState = signal<Partial<OnboardingRequestModel>>({});

  private readonly completedStepsState = signal<OnboardingStep[]>([]);

  readonly completedSteps = this.completedStepsState.asReadonly();

  private readonly currentStepState = signal<OnboardingStep>(
    OnboardingStep.INITIATED
  );


  private readonly loadingState = signal<boolean>(false);

  private readonly errorState = signal<string | null>(null);

  readonly request = this.requestState.asReadonly();

  readonly currentStep = this.currentStepState.asReadonly();

  readonly loading = this.loadingState.asReadonly();

  readonly error = this.errorState.asReadonly();

  updateStepValue<K extends keyof OnboardingRequestModel>(
    key: K,
    value: OnboardingRequestModel[K]
  ): void {

    this.requestState.update(
      (current: any) => ({

        ...current,

        [key]: value

      })
    );

  }

  setCurrentStep(step: OnboardingStep): void {

    this.currentStepState.set(step);

  }

  setLoading(value: boolean): void {

    this.loadingState.set(value);

  }

  setError(message: string | null): void {
    this.errorState.set(message);
  }

  getRequest(): Partial<OnboardingRequestModel> {

    return this.requestState();
  }

  completeStep(step: OnboardingStep): void {

    this.completedStepsState.update(current => {

      if (current.includes(step)) {
        return current;
      }

      const result = [...current, step];

      console.log(result);

      return result;

    });

  }

  reset(): void {

    this.requestState.set({});

    this.currentStepState.set(
      OnboardingStep.INITIATED
    );

    this.loadingState.set(false);

    this.errorState.set(null);

    this.completedStepsState.set([]);

  }

}