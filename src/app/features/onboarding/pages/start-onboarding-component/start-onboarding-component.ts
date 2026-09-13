import { Component, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { OnboardingRequestModel } from '../../../../core/models/onboarding/onboarding-request.model';
import { OnboardingStepComponent } from '../../../../core/models/onboarding/onboarding-step-component.interface';
import { OnboardingStepConfig } from '../../../../core/models/onboarding/onboarding-step-config.';
import { OnboardingStep } from '../../../../core/models/onboarding/onboarding-step.enum';
import { BillingStepComponent } from '../../components/billing-step-component/billing-step-component';
import { ConfirmationStepComponent } from '../../components/confirmation-step-component/confirmation-step-component';
import { OnboardingStepperComponent } from '../../components/onboarding-stepper-component/onboarding-stepper-component';
import { OrganizationMemberStepComponent } from '../../components/organization-member-step-component/organization-member-step-component';
import { OrganizationStepComponent } from '../../components/organization-step-component/organization-step-component';
import { SubscriptionStepComponent } from '../../components/subscription-step-component/subscription-step-component';
import { SuccessStepComponent } from '../../components/success-step-component/success-step-component';
import { TenantStepComponent } from '../../components/tenant-step-component/tenant-step-component';
import { UserStepComponent } from '../../components/user-step-component/user-step-component';
import { OnboardingApiService } from '../../service/onboarding-api.service';
import { OnboardingStateService } from '../../service/onboarding-state.service';
import { OnboardingProgressComponent } from '../../shared/onboarding-progress-component/onboarding-progress-component';
import { ConfigOrganizationService } from '../../../administration/configorganization/services/configorganization.service';
import { NotificationConfigurationUpdateRequest } from '../../../../core/models/notification/notification-configuration-update-request';


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
    OnboardingProgressComponent,
    SuccessStepComponent
  ]
})
export class StartOnboardingComponent {

  readonly api = inject(OnboardingApiService);
  readonly state = inject(OnboardingStateService);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService)
  private readonly configOrganizationService = inject(ConfigOrganizationService);

  readonly OnboardingStep = OnboardingStep;

  readonly currentStep = this.state.currentStep;

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
    return this.steps.find(item => item.step === this.currentStep())!;
  }

  next(): void {

    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveCurrentStepValue();

    this.state.completeStep(this.currentStep());

    const index = this.steps.findIndex(item => item.step === this.currentStep());

    if (index < this.steps.length - 1) {

      const nextStep = this.steps[index + 1].step;

      this.state.setCurrentStep(nextStep);

      this.scrollToTop();

    }
  }

  previous(): void {

    const index = this.steps.findIndex(item => item.step === this.currentStep());

    if (index > 0) {

      this.state.setCurrentStep(this.steps[index - 1].step);

      this.scrollToTop();

    }
  }

  private validateCurrentStep(): boolean {

    if (this.currentStep() === OnboardingStep.CONFIRMATION) {
      return true;
    }

    const component = this.getCurrentComponent();

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

    if (this.currentStep() === OnboardingStep.CONFIRMATION) {
      return;
    }

    const component = this.getCurrentComponent();

    if (!component || component.value === undefined) {
      return;
    }

    switch (this.currentStep()) {

      case OnboardingStep.INITIATED:

        this.state.updateRequest(
          'onboardingStartRequest',
          component.value
        );

        break;

      case OnboardingStep.TENANT:

        this.state.updateRequest(
          'onboardingTenantRequest',
          component.value
        );

        break;

      case OnboardingStep.ORGANIZATION:

        this.state.updateRequest(
          'onboardingOrganizationRequest',
          component.value
        );

        break;

      case OnboardingStep.USER:

        this.state.updateRequest(
          'onboardingUserRequest',
          component.value
        );

        break;

      case OnboardingStep.ORGANIZATION_MEMBER:

        this.state.updateRequest(
          'onboardingOrganizationMemberRequest',
          component.value
        );

        break;

      case OnboardingStep.SUBSCRIPTION:

        this.state.updateRequest(
          'onboardingSubscriptionRequest',
          component.value
        );

        break;

      case OnboardingStep.BILLING:

        this.state.updateRequest(
          'onboardingInvoiceRequest',
          component.value
        );
        break;
    }
  }

  private getCurrentComponent(): OnboardingStepComponent<any> | null {

    switch (this.currentStep()) {

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
        return null;

      default:
        return null;
    }

  }

  submit(): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent,
      {
        centered: true,
        backdrop: 'static'
      }
    );

    modalRef.componentInstance.title = 'Confirmation de création';

    modalRef.componentInstance.message = `Vous êtes sur le point de créer votre espace SaaS.

        Cette action va créer :
        - votre espace
        - votre organisation
        - votre compte administrateur
        - votre abonnement
        - votre facture

        Voulez-vous continuer ?`;

    modalRef.componentInstance.btnOkText = 'Créer mon espace';

    modalRef.componentInstance.btnCancelText = 'Annuler';

    modalRef.result
      .then(result => {
        if (result === true) {

          this.executeSubmit();
        }

      })
      .catch(() => {
        return;
      });
  }


  private executeSubmit(): void {

    const request = this.state.getRequest() as OnboardingRequestModel;

    this.state.setLoading(true);

    console.log("sending payload", request);

    this.api.start(request).subscribe({

      next: response => {

        this.state.setLoading(false);

        if (response.success && response.data) {

          this.state.setResponse(response.data);

          this.state.setCurrentStep(OnboardingStep.COMPLETED);

          this.toastr.success('Votre espace a été créé avec succès.');

          this.createDefaultConfigurationOrganization();

        } else {

          this.state.setError(response.message || 'La création de votre espace a échoué.');

        }

      },

      error: error => {

        this.state.setLoading(false);

        console.error('ONBOARDING ERROR', error);

        this.state.setError(
          'Une erreur est survenue pendant la création.'
        );

      }

    });
  }

  private createDefaultConfigurationOrganization(): void {

    const request = this.state.response()?.successData;

    const payload : NotificationConfigurationUpdateRequest = {
        senderName: request?.tenantName || '',
        senderEmail: request?.tenantEmailContact || request?.organizationEmail,
        senderPhone: request?.tenantMobileContact || request?.organizationMobile,
        replyTo: request?.tenantEmailContact || request?.organizationEmail
    } 

    console.log("sending payload", request);

    this.configOrganizationService.createDefaultNotificationConfiguration(payload).subscribe({
      
      next: response => {

      },
      error: error => {
        this.state.setLoading(false);
        console.error('Default config error ERROR');
      }

    });
  }

  private scrollToTop(): void {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

}