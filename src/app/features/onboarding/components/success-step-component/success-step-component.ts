import { Component, inject } from '@angular/core';
import { OnboardingStateService } from '../../service/onboarding-state.service';


@Component({
  selector: 'app-success-step-component',
  standalone: true,
  imports: [],
  templateUrl: './success-step-component.html',
  styleUrl: './success-step-component.css',
})
export class SuccessStepComponent {

  private readonly state = inject(OnboardingStateService);

  readonly response = this.state.response;

  get successData() {
    return this.response()?.successData;
  }

  async copyCredentials(): Promise<void> {
    const data = this.successData;

    if (!data) {
      return;
    }

    const credentials =
      `${data.tenantName}\n\n` +
      `Identifiant : ${data.loginIdentifier}\n` +
      `Mot de passe temporaire : ${data.temporalPassword}`;

    try {
      await navigator.clipboard.writeText(credentials);
    } catch (error) {
      console.error('Impossible de copier les identifiants', error);
    }
  }


  async copyValue(value: string): Promise<void> {

    if (!value) {
      return;
    }

    try {

      await navigator.clipboard.writeText(value);

    } catch (error) {

      console.error('Impossible de copier la valeur', error);

    }
  }

}