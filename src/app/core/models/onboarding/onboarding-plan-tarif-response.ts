import { OnboardingPlanTarifDetailResponse } from "./onboarding-plan-tarif-detail-response";

export interface OnboardingPlanTarifResponse {

 uuid: string;

  libelle: string;

  currencyUuid: string;

  currencyCode: string;

  currencyLibelle: string;

  details: OnboardingPlanTarifDetailResponse[];

}
