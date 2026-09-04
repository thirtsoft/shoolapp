export interface OnboardingSuccessDataResponseModel {

  tenantCode: string;

  tenantName: string;

  tenantMobileContact: string;

  tenantEmailContact: string;

  organizationName: string;

  organizationMobile: string;

  organizationEmail: string;

  adminFirstName: string;

  adminLastName: string;

  fonctionMember: string;

  loginIdentifier: string;

  temporalPassword: string;

  roleCode: string;

  roleLibelle: string;

  roleDescription: string;

  subscriptionNumero: string;

  subscriptionStatus: string;

  subscriptionSource: string;

  subscriptionDateDebut: Date;

  subscriptionDateFin: Date;

  planLibelle: string;

  invoiceNumero: string;

  invoiceCommentaire: string;

}