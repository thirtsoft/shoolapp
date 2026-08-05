export interface OnboardingResponseModel {

  processUuid: string;

  workflowCode: string;

  status: string;

  currentStep: string;

  applicationCode: string;

  tenantUuid: string;

  tenantCode: string;

  tenantName: string;

  organizationUuid: string;

  organizationMemberUuid: string;

  userUuid: string;

  subscriptionUuid: string;

  subscriptionNumero: string;

  invoiceUuid: string;

  invoiceNumero: string;

  startedAt: Date;

  lastActivityAt: Date;

  completedAt: Date;

  errorMessage: string;

}
