import { OnboardingStatus } from "./onboarding-status.enum";
import { OnboardingStep } from "./onboarding-step.enum";
import { OnboardingSuccessDataResponseModel } from "./onboarding-success-data-response.model";

export interface OnboardingResponseModel {

  processUuid: string;

  workflowCode: string;

  status: OnboardingStatus;

  currentStep: OnboardingStep;

  applicationCode: string;

  tenantUuid: string;

  organizationUuid: string;

  organizationMemberUuid: string;

  userUuid: string;

  subscriptionUuid: string;

  invoiceUuid: string;

  startedAt: string;

  lastActivityAt: string;

  completedAt: string | null;

  errorMessage: string | null;

  successData: OnboardingSuccessDataResponseModel;
}
