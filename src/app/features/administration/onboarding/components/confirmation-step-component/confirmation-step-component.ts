import { Component, computed, inject } from '@angular/core';
import { OnboardingSateService } from '../../service/onboarding-state.service';

@Component({
  selector: 'app-confirmation-step-component',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-step-component.html',
  styleUrl: './confirmation-step-component.css',
})
export class ConfirmationStepComponent {

  private readonly state = inject(OnboardingSateService);

  readonly summary = computed(() => this.state.getRequest());

  isValid(): boolean {
    return true;
  }

  markTouched(): void { }

}
