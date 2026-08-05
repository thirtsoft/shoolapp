export interface OnboardingStepComponent<T> {

  readonly value: T;

  isValid(): boolean;

  markTouched(): void;

}