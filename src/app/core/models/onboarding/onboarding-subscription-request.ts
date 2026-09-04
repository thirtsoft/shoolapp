export interface OnboardingSubscriptionRequest {

  planUuid: string;

  planTarifUuid: string;

  planTarifDetailUuid: string;

  renouvellementAutomatique: boolean;

  commentaire: string;

}