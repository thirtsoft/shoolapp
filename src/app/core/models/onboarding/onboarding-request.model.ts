import { OnboardingInvoiceRequest } from "./onboarding-invoice-request";
import { OnboardingOrganizationMemberRequest } from "./onboarding-organization-member-request";
import { OnboardingOrganizationRequest } from "./onboarding-organization-request";
import { OnboardingStartRequest } from "./onboarding-start-request";
import { OnboardingSubscriptionRequest } from "./onboarding-subscription-request";
import { OnboardingTenantRequest } from "./onboarding-tenant-request";
import { OnboardingUserRequest } from "./onboarding-user-request";

export interface OnboardingRequestModel {

    onboardingStartRequest: OnboardingStartRequest;

    onboardingTenantRequest: OnboardingTenantRequest;

    onboardingOrganizationRequest: OnboardingOrganizationRequest;

    onboardingUserRequest: OnboardingUserRequest;

    onboardingOrganizationMemberRequest: OnboardingOrganizationMemberRequest;

    onboardingSubscriptionRequest: OnboardingSubscriptionRequest;

    onboardingInvoiceRequest: OnboardingInvoiceRequest;

}
