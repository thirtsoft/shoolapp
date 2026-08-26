import { Component, inject } from '@angular/core';
import { OnboardingStateService } from '../../service/onboarding-state.service';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-success-step-component',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './success-step-component.html',
  styleUrl: './success-step-component.css',
})
export class SuccessStepComponent {

  private readonly state = inject(OnboardingStateService);

  readonly response = this.state.response;
}
