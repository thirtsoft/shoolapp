import { Component, inject, signal } from '@angular/core';

import { OnboardingStateService } from '../../service/onboarding-state.service';


@Component({
  selector: 'app-confirmation-step-component',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-step-component.html',
  styleUrl: './confirmation-step-component.css',
})
export class ConfirmationStepComponent {

  private readonly state =    inject(OnboardingStateService);

  readonly request =    this.state.request;

  readonly viewModel =    this.state.viewModel;

  readonly openedCard =    signal<string | null>(null);


  toggle(card: string): void {
    if (this.openedCard() === card) {
      this.openedCard.set(null);
      return;
    }
    this.openedCard.set(card);

  }

  isOpened(card: string): boolean {

    return this.openedCard() === card;

  }

}