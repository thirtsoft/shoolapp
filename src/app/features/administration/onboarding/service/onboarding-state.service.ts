import { Injectable, computed, signal } from '@angular/core';
import { OnboardingRequestModel } from '../../../../core/models/onboarding/onboarding-request.model';
import { OnboardingStep } from '../../../../core/models/onboarding/onboarding-step.enum';
import { OnboardingResponseModel } from '../../../../core/models/onboarding/onboarding-response.model';

export interface OnboardingViewModel {

  currentStep: OnboardingStep;

  completedSteps: OnboardingStep[];

  loading: boolean;

  error: string | null;

  /**
 * Résultat après création complète de l'onboarding
 * Utilisé uniquement pour l'affichage succès
 */
  response?: OnboardingResponseModel;

  /**
   * Informations affichées uniquement côté UI
   * Ne partent jamais au backend
   */
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


  /**
   * Payload métier envoyé au backend
   */
  private readonly requestState = signal<Partial<OnboardingRequestModel>>({});

  /**
   * Etat interne uniquement utilisé par l'interface
   */
  private readonly viewModelState = signal<OnboardingViewModel>({

    currentStep: OnboardingStep.INITIATED,

    completedSteps: [],

    loading: false,

    error: null

  });

  /**
   * Données backend
   */
  readonly request = this.requestState.asReadonly();

  /**
   * Etat UI complet
   */
  readonly viewModel = this.viewModelState.asReadonly();


  /**
   * Etape courante
   */
  readonly currentStep = computed(
    () => this.viewModelState().currentStep
  );



  /**
   * Etapes complétées
   */
  readonly completedSteps = computed(
    () => this.viewModelState().completedSteps
  );



  /**
   * Etat chargement
   */
  readonly loading = computed(
    () => this.viewModelState().loading
  );


  /**
   * Message erreur
   */
  readonly error = computed(
    () => this.viewModelState().error
  );



  /**
   * Résumé abonnement affiché dans l'UI
   */
  readonly subscriptionDisplay = computed(
    () => this.viewModelState().subscriptionDisplay
  );


  /**
 * Réponse backend après succès onboarding
 */
  readonly response = computed(
    () => this.viewModelState().response
  );


  /**
   * Mise à jour d'une donnée métier backend
   */
  updateRequest<K extends keyof OnboardingRequestModel>(
    key: K,
    value: OnboardingRequestModel[K]
  ): void {

    this.requestState.update(current => ({

      ...current,

      [key]: value

    }));

  }



  /**
   * Alias conservé pour compatibilité
   */
  updateStepValue<K extends keyof OnboardingRequestModel>(
    key: K,
    value: OnboardingRequestModel[K]
  ): void {

    this.updateRequest(key, value);

  }

  /**
   * Mise à jour des informations UI
   */
  updateViewModel(value: Partial<OnboardingViewModel>): void {

    this.viewModelState.update(current => ({

      ...current,

      ...value

    }));
  }

  /**
 * Stocke la réponse finale backend
 */
  setResponse(response: OnboardingResponseModel): void {

    this.updateViewModel({

      response

    });

  }

  /**
   * Changement étape courante
   */
  setCurrentStep(step: OnboardingStep): void {

    this.updateViewModel({

      currentStep: step

    });
  }

  /**
   * Activation / désactivation loading
   */
  setLoading(value: boolean): void {

    this.updateViewModel({

      loading: value

    });

  }



  /**
   * Gestion erreur UI
   */
  setError(message: string | null): void {

    this.updateViewModel({

      error: message

    });

  }



  /**
   * Marquer une étape comme terminée
   */
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

  /**
   * Récupération du payload final backend
   */
  getRequest(): Partial<OnboardingRequestModel> {
    return this.requestState();
  }

  /**
   * Réinitialisation complète onboarding
   */
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