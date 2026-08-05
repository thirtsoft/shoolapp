import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TenantStepComponent } from '../../components/tenant-step-component/tenant-step-component';
import { OrganizationStepComponent } from '../../components/organization-step-component/organization-step-component';
import { UserStepComponent } from '../../components/user-step-component/user-step-component';
import { OnboardingStepperComponent } from '../../components/onboarding-stepper-component/onboarding-stepper-component';
import { SubscriptionStepComponent } from '../../components/subscription-step-component/subscription-step-component';
import { BillingStepComponent } from '../../components/billing-step-component/billing-step-component';
import { ConfirmationStepComponent } from '../../components/confirmation-step-component/confirmation-step-component';
import { OnboardingApiService } from '../../service/onboarding-api.service';
import { OnboardingRequestModel } from '../../../../../core/models/onboarding/onboarding-request.model';
import { OrganizationMemberStepComponent } from '../../components/organization-member-step-component/organization-member-step-component';
import { OnboardingStepConfig } from '../../../../../core/models/onboarding/onboarding-step-config.';
import { OnboardingStep } from '../../../../../core/models/onboarding/onboarding-step.enum';
import { OnboardingProgressComponent } from '../../shared/onboarding-progress-component/onboarding-progress-component';
import { OnboardingSateService } from '../../service/onboarding-state.service';

@Component({
  selector: 'app-start-onboarding-component',
  templateUrl: './start-onboarding-component.html',
  styleUrl: './start-onboarding-component.css',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    OnboardingStepperComponent,
    TenantStepComponent,
    OrganizationStepComponent,
    UserStepComponent,
    OrganizationMemberStepComponent,
    SubscriptionStepComponent,
    BillingStepComponent,
    ConfirmationStepComponent,
    OnboardingProgressComponent
  ]
})
export class StartOnboardingComponent {

  readonly api = inject(OnboardingApiService);
  readonly state = inject(OnboardingSateService);

  readonly OnboardingStep = OnboardingStep;

  currentStep = OnboardingStep.INITIATED;

  @ViewChild(OnboardingStepperComponent)
  onboardingStepper!: OnboardingStepperComponent;


  @ViewChild(TenantStepComponent)
  tenantStep!: TenantStepComponent;


  @ViewChild(OrganizationStepComponent)
  organizationStep!: OrganizationStepComponent;


  @ViewChild(UserStepComponent)
  userStep!: UserStepComponent;


  @ViewChild(OrganizationMemberStepComponent)
  organizationMemberStep!: OrganizationMemberStepComponent;


  @ViewChild(SubscriptionStepComponent)
  subscriptionStep!: SubscriptionStepComponent;


  @ViewChild(BillingStepComponent)
  billingStep!: BillingStepComponent;


  @ViewChild(ConfirmationStepComponent)
  confirmationStep!: ConfirmationStepComponent;


  steps: OnboardingStepConfig[] = [


    {
      step: OnboardingStep.INITIATED,
      title: 'Démarrage',
      description: 'Choisissez votre application et votre mode',
      icon: 'rocket',
      component: OnboardingStepperComponent
    },


    {
      step: OnboardingStep.TENANT,
      title: 'Espace',
      description: 'Configurez votre établissement',
      icon: 'building',
      component: TenantStepComponent
    },


    {
      step: OnboardingStep.ORGANIZATION,
      title: 'Organisation',
      description: 'Informations de votre organisation',
      icon: 'school',
      component: OrganizationStepComponent
    },


    {
      step: OnboardingStep.USER,
      title: 'Administrateur',
      description: 'Création du compte administrateur',
      icon: 'user',
      component: UserStepComponent
    },


    {
      step: OnboardingStep.ORGANIZATION_MEMBER,
      title: 'Membre organisation',
      description: 'Poste occupé et rôle',
      icon: 'user',
      component: OrganizationMemberStepComponent
    },


    {
      step: OnboardingStep.SUBSCRIPTION,
      title: 'Abonnement',
      description: 'Choix de votre abonnement',
      icon: 'subscription',
      component: SubscriptionStepComponent
    },


    {
      step: OnboardingStep.BILLING,
      title: 'Facturation',
      description: 'Informations de paiement',
      icon: 'bill',
      component: BillingStepComponent
    },


    {
      step: OnboardingStep.CONFIRMATION,
      title: 'Confirmation',
      description: 'Validation finale',
      icon: 'check',
      component: ConfirmationStepComponent
    }


  ];






  get currentConfig(): OnboardingStepConfig {

    return this.steps.find(
      item => item.step === this.currentStep
    )!;

  }

  next(): void {

    if (!this.validateCurrentStep()) {
      return;
    }

    // Sauvegarde les données de l'étape courante
    this.saveCurrentStepValue();

    // Marque l'étape comme complétée
    this.state.completeStep(this.currentStep);

    console.log(
      'Completed steps : ',
      this.state.completedSteps()
    );

    const index = this.steps.findIndex(
      item => item.step === this.currentStep
    );

    if (index < this.steps.length - 1) {

      const nextStep = this.steps[index + 1].step;

      this.currentStep = nextStep;

      this.state.setCurrentStep(nextStep);

    }

  }
  previous(): void {
    const index = this.steps.findIndex(item => item.step === this.currentStep);

    if (index > 0) {
      this.currentStep = this.steps[index - 1].step;

      this.state.setCurrentStep(this.currentStep);
    }
  }







  private validateCurrentStep(): boolean {



    const component =
      this.getCurrentComponent();



    if (!component) {

      return true;

    }



    if (!component.isValid()) {


      component.markTouched();


      return false;

    }



    return true;


  }








  private saveCurrentStepValue(): void {


    const component =
      this.getCurrentComponent();



    if (!component) {

      return;

    }



    switch (this.currentStep) {



      case OnboardingStep.INITIATED:


        this.state.updateStepValue(
          'onboardingStartRequest',
          component.value
        );

        break;




      case OnboardingStep.TENANT:


        this.state.updateStepValue(
          'onboardingTenantRequest',
          component.value
        );

        break;




      case OnboardingStep.ORGANIZATION:


        this.state.updateStepValue(
          'onboardingOrganizationRequest',
          component.value
        );

        break;




      case OnboardingStep.USER:


        this.state.updateStepValue(
          'onboardingUserRequest',
          component.value
        );

        break;




      case OnboardingStep.ORGANIZATION_MEMBER:


        this.state.updateStepValue(
          'onboardingOrganizationMemberRequest',
          component.value
        );

        break;




      case OnboardingStep.SUBSCRIPTION:


        this.state.updateStepValue(
          'onboardingSubscriptionRequest',
          component.value
        );

        break;




      case OnboardingStep.BILLING:


        this.state.updateStepValue(
          'onboardingInvoiceRequest',
          component.value
        );

        break;


    }


  }







  private getCurrentComponent(): any {


    switch (this.currentStep) {


      case OnboardingStep.INITIATED:
        return this.onboardingStepper;


      case OnboardingStep.TENANT:
        return this.tenantStep;


      case OnboardingStep.ORGANIZATION:
        return this.organizationStep;


      case OnboardingStep.USER:
        return this.userStep;


      case OnboardingStep.ORGANIZATION_MEMBER:
        return this.organizationMemberStep;


      case OnboardingStep.SUBSCRIPTION:
        return this.subscriptionStep;


      case OnboardingStep.BILLING:
        return this.billingStep;


      case OnboardingStep.CONFIRMATION:
        return this.confirmationStep;


      default:
        return null;

    }


  }







  submit(): void {


    const request = this.state.getRequest() as OnboardingRequestModel;



    console.log(
      'ONBOARDING REQUEST',
      request
    );



    /*
    this.api.start(request)
      .subscribe({

        next: response => {

          console.log(response);

        },

        error: error => {

          console.error(error);

        }

      });
    */


  }

}