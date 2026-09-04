import { Injectable, computed, signal } from '@angular/core';
import { OnboardingRequestModel } from '../../../core/models/onboarding/onboarding-request.model';
import { OnboardingResponseModel } from '../../../core/models/onboarding/onboarding-response.model';
import { OnboardingStep } from '../../../core/models/onboarding/onboarding-step.enum';

export interface OnboardingViewModel {

  currentStep: OnboardingStep;

  completedSteps: OnboardingStep[];

  loading: boolean;

  error: string | null;

  response?: OnboardingResponseModel;

  subscriptionDisplay?: {

    planName?: string;

    currencyLabel?: string;

    billingPeriodLabel?: string;

    amount?: number;

  };

}

@Injectable({
  providedIn: 'root'
})
export class OnboardingStateService {


  private readonly requestState = signal<Partial<OnboardingRequestModel>>({});


  private readonly viewModelState = signal<OnboardingViewModel>({

    currentStep: OnboardingStep.INITIATED,

    completedSteps: [],

    loading: false,

    error: null

  });

  readonly request = this.requestState.asReadonly();

  readonly viewModel = this.viewModelState.asReadonly();

  readonly currentStep = computed(
    () => this.viewModelState().currentStep
  );

  readonly completedSteps = computed(
    () => this.viewModelState().completedSteps
  );

  readonly loading = computed(
    () => this.viewModelState().loading
  );

  readonly error = computed(
    () => this.viewModelState().error
  );

  readonly subscriptionDisplay = computed(
    () => this.viewModelState().subscriptionDisplay
  );

  readonly response = computed(
    () => this.viewModelState().response
  );

  updateRequest<K extends keyof OnboardingRequestModel>(
    key: K,
    value: OnboardingRequestModel[K]
  ): void {

    this.requestState.update(current => ({

      ...current,

      [key]: value

    }));

  }

  updateStepValue<K extends keyof OnboardingRequestModel>(
    key: K,
    value: OnboardingRequestModel[K]
  ): void {

    this.updateRequest(key, value);

  }

  updateViewModel(value: Partial<OnboardingViewModel>): void {

    this.viewModelState.update(current => ({

      ...current,

      ...value

    }));
  }


  setResponse(response: OnboardingResponseModel): void {

    this.updateViewModel({

      response

    });

  }

  setCurrentStep(step: OnboardingStep): void {

    this.updateViewModel({

      currentStep: step

    });
  }

  setLoading(value: boolean): void {

    this.updateViewModel({

      loading: value

    });

  }

  setError(message: string | null): void {

    this.updateViewModel({

      error: message

    });

  }

  completeStep(step: OnboardingStep): void {

    this.viewModelState.update(current => {

      if (current.completedSteps.includes(step)) {

        return current;

      }


      return {

        ...current,

        completedSteps: [

          ...current.completedSteps,

          step

        ]

      };


    });

  }

  getRequest(): Partial<OnboardingRequestModel> {
    return this.requestState();
  }
  
  reset(): void {

    this.requestState.set({});

    this.viewModelState.set({

      currentStep: OnboardingStep.INITIATED,

      completedSteps: [],

      loading: false,

      error: null,

      response: undefined,

      subscriptionDisplay: undefined

    });


  }


}