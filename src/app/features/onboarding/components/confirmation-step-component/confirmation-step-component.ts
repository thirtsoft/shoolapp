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


  private readonly state =
    inject(OnboardingStateService);



  /**
   * Données métier prêtes pour le backend
   */
  readonly request =
    this.state.request;



  /**
   * Données d'affichage uniquement UI
   */
  readonly viewModel =
    this.state.viewModel;



  /**
   * Gestion ouverture cartes résumé
   */
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