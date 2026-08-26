import { OnboardingPlanTarifResponse } from "./onboarding-plan-tarif-response";

export interface OnboardingPlanResponse {

  uuid: string;

  code: string;

  libelle: string;

  description: string;

  icon: string | null;

  type: string;

  defaultPlan: boolean;

  recommande: boolean;

  trialPeriodDays: number;

  tarifs: OnboardingPlanTarifResponse[];

}
