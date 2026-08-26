import { OnboardingPlanResponse } from "./onboarding-plan-response";

export interface OnboardingApplicationResponse {

  uuid: string;

  code: string;

  libelle: string;

  description: string;

  icon: string | null;

  plans: OnboardingPlanResponse[];


}